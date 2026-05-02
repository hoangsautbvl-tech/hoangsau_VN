const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'public', 'resource', 'ban-do-viet-nam-geojson');
const outFile = path.join(root, 'public', 'data', 'vietnam-focus.geojson');
const tolerance = 0.004;

function sqDist(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

function sqSegDist(p, a, b) {
  let x = a[0];
  let y = a[1];
  let dx = b[0] - x;
  let dy = b[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = b[0];
      y = b[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  let maxSqDist = sqTolerance;
  let index = -1;

  for (let i = first + 1; i < last; i++) {
    const sqDistance = sqSegDist(points[i], points[first], points[last]);
    if (sqDistance > maxSqDist) {
      index = i;
      maxSqDist = sqDistance;
    }
  }

  if (index > -1) {
    if (index - first > 1) simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    if (last - index > 1) simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
}

function simplifyLine(points, sqTolerance) {
  if (points.length <= 4) return points;

  const simplified = [points[0]];
  simplifyDPStep(points, 0, points.length - 1, sqTolerance, simplified);
  simplified.push(points[points.length - 1]);
  return simplified;
}

function roundPoint(point) {
  return [
    Number(point[0].toFixed(5)),
    Number(point[1].toFixed(5)),
  ];
}

function ringArea(ring) {
  let area = 0;
  for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
    area += (ring[j][0] * ring[i][1]) - (ring[i][0] * ring[j][1]);
  }
  return Math.abs(area / 2);
}

function simplifyRing(ring, sqTolerance) {
  if (!ring || ring.length < 4) return null;

  const open = ring.slice(0, -1).map(roundPoint);
  let simplified = simplifyLine(open, sqTolerance);
  if (simplified.length < 3) return null;
  simplified = simplified.concat([simplified[0]]);

  if (ringArea(simplified) < 0.000002) return null;
  return simplified;
}

function simplifyPolygon(polygon, sqTolerance) {
  const rings = polygon
    .map(ring => simplifyRing(ring, sqTolerance))
    .filter(Boolean);
  return rings.length ? rings : null;
}

function simplifyGeometry(geometry, sqTolerance) {
  if (!geometry) return null;

  if (geometry.type === 'Polygon') {
    const polygon = simplifyPolygon(geometry.coordinates, sqTolerance);
    return polygon ? { type: 'Polygon', coordinates: polygon } : null;
  }

  if (geometry.type === 'MultiPolygon') {
    const polygons = geometry.coordinates
      .map(polygon => simplifyPolygon(polygon, sqTolerance))
      .filter(Boolean);
    return polygons.length ? { type: 'MultiPolygon', coordinates: polygons } : null;
  }

  return null;
}

function readGeoJs(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: filePath });
  const key = Object.keys(context.window).find(name => name.startsWith('geo_'));
  if (!key) throw new Error(`Missing geo variable in ${filePath}`);
  return context.window[key];
}

const sqTolerance = tolerance * tolerance;
const features = [];

for (const fileName of fs.readdirSync(sourceDir).filter(name => name.endsWith('.js')).sort()) {
  const geo = readGeoJs(path.join(sourceDir, fileName));
  for (const feature of geo.features || []) {
    const geometry = simplifyGeometry(feature.geometry, sqTolerance);
    if (!geometry) continue;
    features.push({
      type: 'Feature',
      properties: {
        ma_xa: feature.properties?.ma_xa || '',
        ten_xa: feature.properties?.ten_xa || '',
        ma_tinh: feature.properties?.ma_tinh || '',
        ten_tinh: feature.properties?.ten_tinh || '',
      },
      geometry,
    });
  }
}

const output = {
  type: 'FeatureCollection',
  name: 'Vietnam focus simplified from commune polygons',
  features,
};

fs.writeFileSync(outFile, JSON.stringify(output));
console.log(`Wrote ${features.length} features to ${outFile}`);
