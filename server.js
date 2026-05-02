const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 9000;
const NOMINATIM_EMAIL = process.env.NOMINATIM_EMAIL || '';
const START_URL = `http://localhost:${PORT}/python/index.html`;
const IS_HOSTED = process.env.RENDER === 'true'
  || process.env.RENDER_SERVICE_ID
  || process.env.NODE_ENV === 'production'
  || process.env.DISABLE_AUTO_SHUTDOWN === '1';
const activeClients = new Map();
let browserClientSeen = false;
let shutdownStarted = false;
let server = null;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (/\.(html|css|js|geojson)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-store');
    }
  }
}));

app.get('/map', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function pruneInactiveClients() {
  const now = Date.now();
  for (const [id, lastSeen] of activeClients.entries()) {
    if (now - lastSeen > 120000) activeClients.delete(id);
  }
}

function shutdownWhenBrowserClosed() {
  if (IS_HOSTED) return;
  if (shutdownStarted || !browserClientSeen) return;
  pruneInactiveClients();
  if (activeClients.size > 0) return;

  shutdownStarted = true;
  console.log('Browser closed. Shutting down local server.');
  server?.close(() => process.exit(0));
  windowlessExitFallback();
}

function windowlessExitFallback() {
  setTimeout(() => process.exit(0), 1500).unref();
}

app.post('/api/client-heartbeat', (req, res) => {
  if (IS_HOSTED) return res.json({ ok: true, hosted: true });
  const id = String(req.body?.id || '').trim();
  if (id) {
    browserClientSeen = true;
    activeClients.set(id, Date.now());
  }
  res.json({ ok: true });
});

app.post('/api/client-closed', (req, res) => {
  if (IS_HOSTED) return res.json({ ok: true, hosted: true });
  const id = String(req.body?.id || '').trim();
  if (id) activeClients.delete(id);
  res.json({ ok: true });
  setTimeout(shutdownWhenBrowserClosed, 5000).unref();
});

setInterval(shutdownWhenBrowserClosed, 3000).unref();

app.get('/', (_req, res) => {
  res.redirect('/python/index.html');
});

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

const normalize = text => String(text || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/^(tinh|thanh pho|phuong|xa|dac khu)\s+/i, '')
  .trim();

const stripLeadingType = name => String(name || '').replace(/^(Tỉnh|Thành phố|Phường|Xã|Đặc khu)\s+/i, '').trim();
const getPlaceType = name => {
  const value = String(name || '').trim();
  if (/^Phường\s+/i.test(value)) return 'phuong';
  if (/^Đặc khu\s+/i.test(value)) return 'dac_khu';
  return 'xa';
};
const getProvinceDisplayType = fullName => /^Thành phố\s+/i.test(String(fullName || '')) ? 'Thành phố' : 'Tỉnh';

function loadAddressDB() {
  const raw = require('vietnam-address-database');
  let provinces = [];
  let wards = [];
  let wardMappings = [];
  let version = 'unknown';

  for (const item of raw) {
    if (item.type === 'header' && item.version) version = item.version;
    if (item.type === 'table' && item.name === 'provinces') provinces = item.data || [];
    if (item.type === 'table' && item.name === 'wards') wards = item.data || [];
    if (item.type === 'table' && item.name === 'ward_mappings') wardMappings = item.data || [];
  }
  return { version, provinces, wards, wardMappings };
}

const db = loadAddressDB();

const provinceMeta = [
  ['01','Hà Nội','Thành phố','Đồng bằng sông Hồng',21.0285,105.8542,[], 'Hà Nội'],
  ['04','Cao Bằng','Tỉnh','Trung du và miền núi phía Bắc',22.6666,106.257,[], 'Cao Bằng'],
  ['08','Tuyên Quang','Tỉnh','Trung du và miền núi phía Bắc',21.823,105.2181,['Hà Giang','Tuyên Quang'], 'Tuyên Quang'],
  ['11','Lạng Sơn','Tỉnh','Trung du và miền núi phía Bắc',21.8478,106.7578,[], 'Lạng Sơn'],
  ['12','Thái Nguyên','Tỉnh','Trung du và miền núi phía Bắc',21.5942,105.8482,['Bắc Kạn','Thái Nguyên'], 'Thái Nguyên'],
  ['14','Quảng Ninh','Tỉnh','Đồng bằng sông Hồng',21.0064,107.2925,[], 'Hạ Long'],
  ['19','Bắc Ninh','Tỉnh','Đồng bằng sông Hồng',21.1214,106.1111,['Bắc Giang','Bắc Ninh'], 'Bắc Ninh'],
  ['20','Hải Phòng','Thành phố','Đồng bằng sông Hồng',20.8449,106.6881,['Hải Dương','Hải Phòng'], 'Hải Phòng'],
  ['22','Hưng Yên','Tỉnh','Đồng bằng sông Hồng',20.6464,106.0511,['Hưng Yên','Thái Bình'], 'Hưng Yên'],
  ['24','Ninh Bình','Tỉnh','Đồng bằng sông Hồng',20.2506,105.9745,['Hà Nam','Nam Định','Ninh Bình'], 'Ninh Bình'],
  ['25','Phú Thọ','Tỉnh','Trung du và miền núi phía Bắc',21.398,105.1619,['Hòa Bình','Phú Thọ','Vĩnh Phúc'], 'Việt Trì'],
  ['26','Lào Cai','Tỉnh','Trung du và miền núi phía Bắc',22.4809,103.9755,['Lào Cai','Yên Bái'], 'Lào Cai'],
  ['30','Điện Biên','Tỉnh','Trung du và miền núi phía Bắc',21.386,103.023,[], 'Điện Biên Phủ'],
  ['31','Lai Châu','Tỉnh','Trung du và miền núi phía Bắc',22.3964,103.4582,[], 'Lai Châu'],
  ['33','Sơn La','Tỉnh','Trung du và miền núi phía Bắc',21.328,103.9144,[], 'Sơn La'],
  ['36','Thanh Hóa','Tỉnh','Bắc Trung Bộ và Duyên hải miền Trung',19.8067,105.7852,[], 'Thanh Hóa'],
  ['38','Nghệ An','Tỉnh','Bắc Trung Bộ và Duyên hải miền Trung',18.6796,105.6813,[], 'Vinh'],
  ['40','Hà Tĩnh','Tỉnh','Bắc Trung Bộ và Duyên hải miền Trung',18.3428,105.9057,[], 'Hà Tĩnh'],
  ['42','Quảng Trị','Tỉnh','Bắc Trung Bộ và Duyên hải miền Trung',16.7403,107.1855,['Quảng Bình','Quảng Trị'], 'Đồng Hới'],
  ['44','Huế','Thành phố','Bắc Trung Bộ và Duyên hải miền Trung',16.4637,107.5909,[], 'Huế'],
  ['46','Đà Nẵng','Thành phố','Bắc Trung Bộ và Duyên hải miền Trung',16.0544,108.2022,['Đà Nẵng','Quảng Nam'], 'Đà Nẵng'],
  ['48','Quảng Ngãi','Tỉnh','Bắc Trung Bộ và Duyên hải miền Trung',15.1214,108.8044,['Kon Tum','Quảng Ngãi'], 'Quảng Ngãi'],
  ['51','Gia Lai','Tỉnh','Tây Nguyên',13.8079,108.1094,['Bình Định','Gia Lai'], 'Pleiku'],
  ['56','Khánh Hòa','Tỉnh','Bắc Trung Bộ và Duyên hải miền Trung',12.2388,109.1967,['Khánh Hòa','Ninh Thuận'], 'Nha Trang'],
  ['66','Đắk Lắk','Tỉnh','Tây Nguyên',12.6667,108.05,['Đắk Lắk','Phú Yên'], 'Buôn Ma Thuột'],
  ['68','Lâm Đồng','Tỉnh','Tây Nguyên',11.9404,108.4583,['Đắk Nông','Lâm Đồng','Bình Thuận'], 'Đà Lạt'],
  ['75','Đồng Nai','Tỉnh','Đông Nam Bộ',10.9453,106.824,[], 'Biên Hòa'],
  ['79','Hồ Chí Minh','Thành phố','Đông Nam Bộ',10.7769,106.7009,['Bà Rịa - Vũng Tàu','Bình Dương','Hồ Chí Minh'], 'Hồ Chí Minh'],
  ['80','Tây Ninh','Tỉnh','Đông Nam Bộ',11.3104,106.0983,['Long An','Tây Ninh'], 'Tây Ninh'],
  ['82','Đồng Tháp','Tỉnh','Đồng bằng sông Cửu Long',10.4938,105.6882,['Đồng Tháp','Tiền Giang'], 'Mỹ Tho'],
  ['86','Vĩnh Long','Tỉnh','Đồng bằng sông Cửu Long',10.2537,105.9722,['Bến Tre','Trà Vinh','Vĩnh Long'], 'Vĩnh Long'],
  ['91','An Giang','Tỉnh','Đồng bằng sông Cửu Long',10.5216,105.1259,['An Giang','Kiên Giang'], 'Long Xuyên'],
  ['92','Cần Thơ','Thành phố','Đồng bằng sông Cửu Long',10.0452,105.7469,['Cần Thơ','Hậu Giang','Sóc Trăng'], 'Cần Thơ'],
  ['96','Cà Mau','Tỉnh','Đồng bằng sông Cửu Long',9.1769,105.1524,['Bạc Liêu','Cà Mau'], 'Cà Mau'],
].map(([code,name,type,region,lat,lng,merged_from,capital]) => ({ code,name,type,region,lat,lng,merged_from,capital,full_name:`${type} ${name}` }));

const dongNaiMeta = provinceMeta.find(province => province.code === '75');
if (dongNaiMeta) {
  dongNaiMeta.name = 'Đồng Nai';
  dongNaiMeta.type = 'Thành phố';
  dongNaiMeta.region = 'Đông Nam Bộ';
  dongNaiMeta.merged_from = ['Đồng Nai', 'Bình Phước'];
  dongNaiMeta.capital = 'Biên Hòa';
  dongNaiMeta.full_name = 'Thành phố Đồng Nai';
}

const provinceMetaByCode = new Map(provinceMeta.map(p => [p.code, p]));
const provincePointsGeo = {
  type: 'FeatureCollection',
  features: provinceMeta.map(p => ({
    type: 'Feature',
    properties: p,
    geometry: { type: 'Point', coordinates: [p.lng, p.lat] }
  }))
};

const provinceByCode = new Map();
const provinceIndex = [];
for (const province of db.provinces) {
  const code = String(province.province_code || province.code || '').padStart(2, '0');
  const meta = provinceMetaByCode.get(code) || {};
  const fullName = meta.full_name || province.name || `${meta.type || ''} ${meta.name || ''}`.trim();
  const item = {
    code,
    full_name: fullName,
    name: meta.name || stripLeadingType(province.short_name || province.name || fullName),
    type: meta.type || getProvinceDisplayType(fullName),
    region: meta.region || 'Chưa gán vùng',
    lat: meta.lat || 16.4,
    lng: meta.lng || 107.7,
    merged: Array.isArray(meta.merged_from) && meta.merged_from.length > 0,
    merged_from: Array.isArray(meta.merged_from) ? meta.merged_from : [],
    capital: meta.capital || stripLeadingType(province.short_name || province.name || fullName),
    place_type: province.place_type || meta.type || getProvinceDisplayType(fullName),
    short_name: province.short_name || stripLeadingType(fullName),
  };
  provinceByCode.set(code, item);
  provinceIndex.push(item);
}
provinceIndex.sort((a, b) => a.code.localeCompare(b.code));

const mappingByNewCode = new Map();
for (const mapping of db.wardMappings) {
  const code = String(mapping.new_ward_code || '').padStart(5, '0');
  if (!mappingByNewCode.has(code)) mappingByNewCode.set(code, []);
  mappingByNewCode.get(code).push(mapping);
}

const communeIndex = [];
const communeByCode = new Map();
const communesByProvinceCode = new Map();
for (const ward of db.wards) {
  const code = String(ward.ward_code || ward.code || '').padStart(5, '0');
  const provinceCode = String(ward.province_code || '').padStart(2, '0');
  const province = provinceByCode.get(provinceCode);
  const fullName = ward.name || '';
  const mappings = mappingByNewCode.get(code) || [];
  const oldUnits = mappings.map(m => ({
    old_code: String(m.old_ward_code || '').padStart(5, '0'),
    old_name: String(m.old_ward_name || '').trim(),
    old_district_name: String(m.old_district_name || '').trim(),
    old_province_name: String(m.old_province_name || '').trim(),
  }));
  const item = {
    code,
    full_name: fullName,
    name: stripLeadingType(fullName),
    type: getPlaceType(fullName),
    province_code: provinceCode,
    province_name: province ? province.name : '',
    province_full_name: province ? province.full_name : '',
    old_units: oldUnits,
    old_unit_names: oldUnits.map(x => x.old_name),
    old_district_names: [...new Set(oldUnits.map(x => x.old_district_name).filter(Boolean))],
    status: oldUnits.length ? 'sap_nhap' : 'giu_nguyen',
    mapping_count: oldUnits.length,
  };
  communeIndex.push(item);
  communeByCode.set(code, item);
  if (!communesByProvinceCode.has(provinceCode)) communesByProvinceCode.set(provinceCode, []);
  communesByProvinceCode.get(provinceCode).push(item);
}
for (const list of communesByProvinceCode.values()) list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
communeIndex.sort((a, b) => a.name.localeCompare(b.name, 'vi'));

function queryProvinces(q) {
  if (!q) return provinceIndex;
  return provinceIndex.filter(x => normalize([x.code, x.name, x.full_name, x.region, ...(x.merged_from || [])].join(' ')).includes(q));
}

function queryCommunes(q, provinceCode) {
  let items = provinceCode ? (communesByProvinceCode.get(provinceCode) || []) : communeIndex;
  if (!q) return items;
  return items.filter(x => normalize([x.code, x.name, x.full_name, x.province_name, ...(x.old_unit_names || []), ...(x.old_district_names || [])].join(' ')).includes(q));
}

function chooseBestNominatimResult(results, { q = '', province = '', level = '' }) {
  const nq = normalize(q);
  const np = normalize(province);
  const candidates = Array.isArray(results) ? results.filter(r => r.geojson) : [];
  if (!candidates.length) return null;

  const withScore = candidates.map(item => {
    let score = 0;
    const name = normalize(item.name || item.display_name || '');
    const display = normalize(item.display_name || '');
    const state = normalize(item.address?.state || item.address?.county || '');
    if (name && nq.includes(name)) score += 6;
    if (display && display.includes(nq)) score += 3;
    if (np && (state.includes(np) || display.includes(np))) score += 4;
    if (level === 'province' && ['administrative','boundary'].includes(item.class)) score += 2;
    if (level === 'commune' && ['administrative','boundary'].includes(item.class)) score += 2;
    if (item.type === 'administrative') score += 2;
    if (item.importance) score += Number(item.importance);
    return { item, score };
  }).sort((a, b) => b.score - a.score);

  return withScore[0]?.item || null;
}

app.get('/api/summary', (_req, res) => {
  res.json({
    province_count: provinceIndex.length,
    commune_count_official: communeIndex.length,
    mapping_count: db.wardMappings.length,
    source: 'vietnam-address-database',
    dataset_version: db.version,
    effective_from: '2025-07-01',
  });
});

app.get('/api/provinces', (req, res) => {
  const q = normalize(req.query.q || '');
  const items = queryProvinces(q);
  res.json({ total: items.length, items });
});

app.get('/api/provinces/:code', (req, res) => {
  const item = provinceByCode.get(String(req.params.code));
  if (!item) return res.status(404).json({ message: 'Không tìm thấy tỉnh/thành.' });
  res.json(item);
});

app.get('/api/communes', (req, res) => {
  const q = normalize(req.query.q || '');
  const provinceCode = String(req.query.province_code || '');
  const items = queryCommunes(q, provinceCode);
  res.json({ total: items.length, items });
});

app.get('/api/communes/:code', (req, res) => {
  const item = communeByCode.get(String(req.params.code));
  if (!item) return res.status(404).json({ message: 'Không tìm thấy xã/phường/đặc khu.' });
  res.json(item);
});

app.get('/api/lookup-old', (req, res) => {
  const q = normalize(req.query.q || '');
  if (!q) return res.json({ total: 0, items: [] });
  const items = db.wardMappings
    .filter(x => normalize([x.old_ward_code, x.old_ward_name, x.old_district_name, x.old_province_name, x.new_ward_code, x.new_ward_name, x.new_province_name].join(' ')).includes(q))
    .slice(0, 200)
    .map(x => ({
      old_code: String(x.old_ward_code || '').padStart(5, '0'),
      old_name: String(x.old_ward_name || '').trim(),
      old_district_name: String(x.old_district_name || '').trim(),
      old_province_name: String(x.old_province_name || '').trim(),
      new_code: String(x.new_ward_code || '').padStart(5, '0'),
      new_name: String(x.new_ward_name || '').trim(),
      province_name: String(x.new_province_name || '').trim(),
    }));
  res.json({ total: items.length, items });
});

app.get('/api/geojson/provinces', (_req, res) => res.json(provincePointsGeo));


app.get('/api/maritime', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'data', 'maritime-features.geojson'));
});

app.get('/api/weather', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ message: 'lat/lng bắt buộc' });
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m');
  url.searchParams.set('timezone', 'Asia/Bangkok');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('weather upstream failed');
    res.json(await response.json());
  } catch (error) {
    res.status(502).json({ message: 'Không lấy được thời tiết trực tuyến.', error: error.message });
  }
});

app.get('/api/boundary/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const province = String(req.query.province || '').trim();
  const level = String(req.query.level || '').trim();
  if (!q) return res.status(400).json({ message: 'q bắt buộc' });

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('countrycodes', 'vn');
  url.searchParams.set('limit', '10');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('polygon_threshold', '0.001');
  if (NOMINATIM_EMAIL) url.searchParams.set('email', NOMINATIM_EMAIL);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'vietnam-admin-map/1.0' }
    });
    if (!response.ok) throw new Error(`boundary upstream failed: ${response.status}`);
    const results = await response.json();
    const best = chooseBestNominatimResult(results, { q, province, level });
    if (!best) return res.status(404).json({ message: 'Không tìm thấy ranh giới phù hợp.' });
    const population = best.extratags?.population || best.extratags?.population_date || best.population || null;
    return res.json({
      name: best.name,
      display_name: best.display_name,
      population,
      lat: best.lat,
      lon: best.lon,
      feature: {
        type: 'Feature',
        properties: {
          name: best.name,
          display_name: best.display_name,
          population,
        },
        geometry: best.geojson,
      }
    });
  } catch (error) {
    res.status(502).json({ message: 'Không lấy được ranh giới trực tuyến.', error: error.message });
  }
});

function openBrowser(url) {
  if (IS_HOSTED) return;
  if (process.env.NO_BROWSER === '1') return;

  const command = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;

  exec(command, error => {
    if (error) {
      console.log(`Khong the tu mo trinh duyet. Vui long mo: ${url}`);
    }
  });
}

server = app.listen(PORT, () => {
  console.log(`Server running at ${START_URL}`);
  openBrowser(START_URL);
});
