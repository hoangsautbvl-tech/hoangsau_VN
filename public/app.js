const GEO_BASE = '/resource/ban-do-viet-nam-geojson';
const DEFAULT_PROVINCE_CODE = '86';

const provinceFiles = {
  '01': 'tinh_ha_noi',
  '04': 'tinh_cao_bang',
  '08': 'tinh_tuyen_quang',
  '11': 'tinh_lang_son',
  '12': 'tinh_thai_nguyen',
  '14': 'tinh_quang_ninh',
  '19': 'tinh_bac_ninh',
  '20': 'tinh_hai_phong',
  '22': 'tinh_hung_yen',
  '24': 'tinh_ninh_binh',
  '25': 'tinh_phu_tho',
  '26': 'tinh_lao_cai',
  '30': 'tinh_dien_bien',
  '31': 'tinh_lai_chau',
  '33': 'tinh_son_la',
  '36': 'tinh_thanh_hoa',
  '38': 'tinh_nghe_an',
  '40': 'tinh_ha_tinh',
  '42': 'tinh_quang_tri',
  '44': 'tinh_hue',
  '46': 'tinh_da_nang',
  '48': 'tinh_quang_ngai',
  '51': 'tinh_gia_lai',
  '56': 'tinh_khanh_hoa',
  '66': 'tinh_dak_lak',
  '68': 'tinh_lam_dong',
  '75': 'tinh_dong_nai',
  '79': 'tinh_ho_chi_minh',
  '80': 'tinh_tay_ninh',
  '82': 'tinh_dong_thap',
  '86': 'tinh_vinh_long',
  '91': 'tinh_an_giang',
  '92': 'tinh_can_tho',
  '96': 'tinh_ca_mau',
};

const state = {
  map: null,
  provinces: [],
  provinceByCode: new Map(),
  vietnamFocusLayer: null,
  neighborLabelLayer: null,
  provinceLabelLayer: null,
  communeLayer: null,
  communeLabelLayer: null,
  maritimeLayer: null,
  islandSymbolLayer: null,
  locationMarker: null,
  selectedProvince: null,
  geoCache: new Map(),
};

const el = id => document.getElementById(id);
const fmt = n => new Intl.NumberFormat('vi-VN').format(n);
const fmt1 = n => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(n);

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[ch]));

function isValidLatLng(latlng) {
  return Boolean(latlng)
    && Number.isFinite(Number(latlng.lat))
    && Number.isFinite(Number(latlng.lng));
}

function provinceLatLng(province) {
  const lat = Number(province?.lat);
  const lng = Number(province?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return L.latLng(lat, lng);
}

function safeBoundsCenter(bounds, fallback = null) {
  if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
    const center = bounds.getCenter();
    if (isValidLatLng(center)) return center;
  }

  if (isValidLatLng(fallback)) {
    return L.latLng(Number(fallback.lat), Number(fallback.lng));
  }

  if (Array.isArray(fallback) && fallback.length >= 2) {
    const lat = Number(fallback[0]);
    const lng = Number(fallback[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return L.latLng(lat, lng);
  }

  return null;
}

async function j(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function repairText(value) {
  const text = String(value ?? '');
  if (!/[ÃÄÅÆÐÑº»¼½]/.test(text)) return text;
  try {
    return decodeURIComponent(escape(text));
  } catch (_error) {
    return text;
  }
}

function repairText(value) {
  const text = String(value ?? '');
  if (!/(?:\u00c3|\u00c2|\u00c4|\u00c5|\u00c6|\u00d0|\u0102|\u00e2\u20ac|\u00e1\u00ba|\u00e1\u00bb)/.test(text)) return text;
  try {
    const windows1252 = {
      '\u20ac': 0x80, '\u201a': 0x82, '\u0192': 0x83, '\u201e': 0x84,
      '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87, '\u02c6': 0x88,
      '\u2030': 0x89, '\u0160': 0x8a, '\u2039': 0x8b, '\u0152': 0x8c,
      '\u017d': 0x8e, '\u2018': 0x91, '\u2019': 0x92, '\u201c': 0x93,
      '\u201d': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
      '\u02dc': 0x98, '\u2122': 0x99, '\u0161': 0x9a, '\u203a': 0x9b,
      '\u0153': 0x9c, '\u017e': 0x9e, '\u0178': 0x9f, '\u0102': 0xc3,
    };
    const bytes = [];
    for (const char of text) {
      const code = char.charCodeAt(0);
      if (code <= 0xff) bytes.push(code);
      else if (windows1252[char] !== undefined) bytes.push(windows1252[char]);
      else return text;
    }
    return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
  } catch (_error) {
    return text;
  }
}

function repairList(values) {
  return Array.isArray(values) ? values.map(repairText) : [];
}

function repairProvince(province) {
  return {
    ...province,
    name: repairText(province.name),
    type: repairText(province.type),
    full_name: repairText(province.full_name),
    region: repairText(province.region),
    capital: repairText(province.capital),
    merged_from: repairList(province.merged_from),
  };
}

function normalize(text) {
  return repairText(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/đ/g, 'd')
    .replace(/^(tinh|thanh pho|tp|thu do|phuong|xa|dac khu)\s+/i, '')
    .trim();
}

function setStatus(text) {
  el('map-status').textContent = text;
}

function setLoading(visible, text = 'Đang tải bản đồ...') {
  const box = el('map-loading');
  box.textContent = text;
  box.classList.toggle('hidden', !visible);
}

function displayProvinceName(province) {
  if (province.code === '01') return 'Thủ đô Hà Nội';
  if (province.type === 'Thành phố') return `TP ${province.name}`;
  return province.name;
}

function displayProvinceName(province) {
  if (province.code === '01') return repairText('Thá»§ Ä‘Ă´ HĂ  Ná»™i');
  if (normalize(province.type) === 'thanh pho') return `TP ${repairText(province.name)}`;
  return repairText(province.name);
}

function communeType(feature) {
  const type = repairText(feature?.properties?.loai || '');
  return type || 'Xã/phường';
}

function communeName(feature) {
  const name = repairText(feature?.properties?.ten_xa || feature?.properties?.name || '');
  return name || 'Không rõ';
}

function metric(value, suffix = '') {
  if (value === undefined || value === null || value === '') return 'Không rõ';
  const numeric = Number(value);
  const display = Number.isFinite(numeric) ? fmt1(numeric) : repairText(value);
  return `${escapeHtml(display)}${suffix}`;
}

function islandInfoForName(name, properties = {}) {
  const normalized = normalize(name);
  const fallbackAdmin = repairText(properties.admin_note || 'Thuộc Việt Nam');
  const territoryNote = 'Địa danh này là một phần không thể thiếu của lãnh thổ Việt Nam.';

  if (normalized.includes('phu quoc')) {
    return {
      admin: 'Thuộc thành phố Phú Quốc, tỉnh An Giang theo hệ thống hành chính sau sắp xếp 2025; trước đây thuộc tỉnh Kiên Giang.',
      description: 'Phú Quốc là đảo lớn nhất Việt Nam, trung tâm du lịch, dịch vụ biển đảo và kinh tế biển ở vịnh Thái Lan.',
      territoryNote,
    };
  }
  if (normalized.includes('hoang sa')) {
    return {
      admin: 'Thuộc huyện Hoàng Sa, thành phố Đà Nẵng.',
      description: 'Quần đảo Hoàng Sa nằm ngoài khơi miền Trung Việt Nam và được thể hiện trên bản đồ để nhận diện đầy đủ không gian biển đảo Việt Nam.',
      territoryNote,
    };
  }
  if (normalized.includes('truong sa')) {
    return {
      admin: 'Thuộc huyện Trường Sa, tỉnh Khánh Hòa.',
      description: 'Quần đảo Trường Sa ở Biển Đông, gồm nhiều đảo, đá và bãi; lớp bản đồ này bổ sung để thể hiện đầy đủ biển đảo Việt Nam.',
      territoryNote,
    };
  }
  if (normalized.includes('con dao')) {
    return {
      admin: 'Thuộc đặc khu Côn Đảo, Thành phố Hồ Chí Minh theo hệ thống hành chính sau sắp xếp 2025; trước đây thuộc tỉnh Bà Rịa - Vũng Tàu.',
      description: 'Côn Đảo là quần đảo quan trọng về du lịch, sinh thái biển và di tích lịch sử.',
      territoryNote,
    };
  }
  if (normalized.includes('ly son')) {
    return {
      admin: 'Thuộc đặc khu Lý Sơn, tỉnh Quảng Ngãi.',
      description: 'Lý Sơn là đảo tiền tiêu ngoài khơi Quảng Ngãi, nổi bật về văn hóa biển và nghề cá.',
      territoryNote,
    };
  }
  if (normalized.includes('cat ba')) {
    return {
      admin: 'Thuộc đặc khu Cát Hải, thành phố Hải Phòng.',
      description: 'Cát Bà là đảo lớn thuộc Hải Phòng, gắn với vịnh Lan Hạ, du lịch biển và bảo tồn sinh thái.',
      territoryNote,
    };
  }
  if (normalized.includes('bach long vi')) {
    return {
      admin: 'Thuộc đặc khu Bạch Long Vĩ, thành phố Hải Phòng.',
      description: 'Bạch Long Vĩ là đảo tiền tiêu ở vịnh Bắc Bộ, có vị trí quan trọng về kinh tế biển và quốc phòng.',
      territoryNote,
    };
  }
  if (normalized.includes('con co')) {
    return {
      admin: 'Thuộc đặc khu Cồn Cỏ, tỉnh Quảng Trị.',
      description: 'Cồn Cỏ là đảo tiền tiêu ngoài khơi Quảng Trị, có giá trị về sinh thái biển và vị trí chiến lược.',
      territoryNote,
    };
  }
  if (normalized.includes('cu lao cham')) {
    return {
      admin: 'Thuộc thành phố Đà Nẵng theo hệ thống hành chính sau sắp xếp 2025; trước đây thuộc tỉnh Quảng Nam.',
      description: 'Cù Lao Chàm là cụm đảo ven bờ miền Trung, nổi bật về sinh thái biển, văn hóa và du lịch.',
      territoryNote,
    };
  }
  if (normalized.includes('phu quy')) {
    return {
      admin: 'Thuộc tỉnh Lâm Đồng theo hệ thống hành chính sau sắp xếp 2025; trước đây thuộc tỉnh Bình Thuận.',
      description: 'Phú Quý là đảo ngoài khơi Nam Trung Bộ, có thế mạnh về thủy sản, năng lượng và du lịch biển.',
      territoryNote,
    };
  }
  if (normalized.includes('nam du')) {
    return {
      admin: 'Thuộc tỉnh An Giang theo hệ thống hành chính sau sắp xếp 2025; trước đây thuộc tỉnh Kiên Giang.',
      description: 'Nam Du là quần đảo ở vịnh Thái Lan, nổi bật về du lịch biển đảo và nghề cá.',
      territoryNote,
    };
  }
  if (normalized.includes('tho chu')) {
    return {
      admin: 'Thuộc đặc khu Thổ Châu, tỉnh An Giang theo hệ thống hành chính sau sắp xếp 2025; trước đây thuộc tỉnh Kiên Giang.',
      description: 'Thổ Chu là đảo tiền tiêu ở vùng biển Tây Nam Việt Nam, có vị trí quan trọng về biển đảo.',
      territoryNote,
    };
  }
  if (normalized.includes('phu lam') || normalized.includes('tri ton')) {
    return {
      admin: 'Điểm đảo đại diện thuộc quần đảo Hoàng Sa, huyện Hoàng Sa, thành phố Đà Nẵng.',
      description: 'Đây là điểm đảo đại diện để hỗ trợ nhận diện quần đảo Hoàng Sa trên bản đồ.',
      territoryNote,
    };
  }
  if (normalized.includes('song tu tay') || normalized.includes('sinh ton')) {
    return {
      admin: 'Điểm đảo đại diện thuộc quần đảo Trường Sa, huyện Trường Sa, tỉnh Khánh Hòa.',
      description: 'Đây là điểm đảo đại diện để hỗ trợ nhận diện quần đảo Trường Sa trên bản đồ.',
      territoryNote,
    };
  }

  return {
    admin: fallbackAdmin,
    description: repairText(properties.description || 'Đảo/quần đảo Việt Nam được bổ sung để bản đồ thể hiện đầy đủ không gian biển đảo.'),
    territoryNote,
  };
}

function islandInfoHtml(info) {
  return `
    <div class="xa-merge island-admin"><b>Đơn vị hành chính:</b><br>${escapeHtml(info.admin)}</div>
    <div class="xa-merge special-info"><b>Thông tin:</b><br>${escapeHtml(info.description)}</div>
    <div class="xa-weather territory-note">${escapeHtml(info.territoryNote)}</div>
  `;
}

function shouldShowIslandInfo(name) {
  const normalized = normalize(name);
  return [
    'phu quoc',
    'hoang sa',
    'truong sa',
    'con dao',
    'ly son',
    'cat ba',
    'bach long vi',
    'con co',
    'cu lao cham',
    'phu quy',
    'nam du',
    'tho chu',
    'phu lam',
    'tri ton',
    'song tu tay',
    'sinh ton',
  ].some(keyword => normalized.includes(keyword));
}

function clearMaritimeLayer() {
  if (state.islandSymbolLayer) state.map.removeLayer(state.islandSymbolLayer);
  if (state.maritimeLayer) state.map.removeLayer(state.maritimeLayer);
  state.islandSymbolLayer = null;
  state.maritimeLayer = null;
}

function featureBounds(feature) {
  try {
    const bounds = L.geoJSON(feature).getBounds();
    return bounds && bounds.isValid() ? bounds : null;
  } catch (_error) {
    return null;
  }
}

function maritimeLabelClass(kind) {
  if (kind === 'archipelago') return 'maritime-map-label maritime-map-label--archipelago';
  if (kind === 'island_group') return 'maritime-map-label maritime-map-label--group';
  if (kind === 'representative_feature') return 'maritime-map-label maritime-map-label--representative';
  return 'maritime-map-label maritime-map-label--island';
}

function maritimeLabelSize(name) {
  const width = Math.round(Math.max(82, Math.min(188, name.length * 7.4 + 16)));
  return [width, 18];
}

function maritimeSymbolStyle(kind) {
  if (kind === 'archipelago') {
    return { radius: 3.2, fillColor: '#fb7185', color: '#be123c', weight: 1 };
  }
  if (kind === 'island_group') {
    return { radius: 3.5, fillColor: '#f87171', color: '#991b1b', weight: 1 };
  }
  if (kind === 'representative_feature') {
    return { radius: 4, fillColor: '#dc2626', color: '#7f1d1d', weight: 1.2 };
  }
  return { radius: 3.6, fillColor: '#ef4444', color: '#991b1b', weight: 1 };
}

function maritimeDisplayPoints(feature, bounds) {
  if (!bounds || !bounds.isValid()) return [];
  const kind = feature?.properties?.kind || '';
  const name = normalize(repairText(feature?.properties?.name || ''));
  const center = bounds.getCenter();
  const width = Math.max(bounds.getEast() - bounds.getWest(), 0.01);
  const height = Math.max(bounds.getNorth() - bounds.getSouth(), 0.01);
  const points = [];
  const add = (dx, dy) => {
    points.push([center.lat + dy * height, center.lng + dx * width]);
  };

  if (kind === 'archipelago') {
    if (name.includes('hoang sa')) {
      add(-0.24, 0.06);
      add(-0.12, -0.08);
      add(-0.02, 0.02);
      add(0.12, -0.06);
      add(0.22, 0.10);
      add(0.30, -0.12);
      add(0.06, 0.18);
    } else if (name.includes('truong sa')) {
      add(-0.34, 0.10);
      add(-0.24, -0.16);
      add(-0.16, 0.18);
      add(-0.04, -0.10);
      add(0.08, 0.12);
      add(0.20, -0.16);
      add(0.30, 0.04);
      add(0.38, -0.06);
      add(0.16, 0.24);
      add(0.02, -0.28);
    } else {
      add(-0.16, 0.04);
      add(-0.04, -0.08);
      add(0.10, 0.03);
      add(0.22, -0.02);
      add(0.06, 0.15);
    }
    return points;
  }

  if (kind === 'island_group') {
    add(-0.08, 0.02);
    add(0.04, -0.06);
    add(0.14, 0.08);
    return points;
  }

  if (kind === 'representative_feature') {
    add(0, 0);
    return points;
  }

  add(-0.02, 0.02);
  return points;
}

function maritimeLabelPoint(feature, bounds) {
  if (!bounds || !bounds.isValid()) return null;
  const kind = feature?.properties?.kind || '';
  const center = bounds.getCenter();
  const width = Math.max(bounds.getEast() - bounds.getWest(), 0.01);
  const height = Math.max(bounds.getNorth() - bounds.getSouth(), 0.01);

  if (kind === 'archipelago') {
    return [center.lat + height * 0.18, center.lng - width * 0.03];
  }
  if (kind === 'island_group') {
    return [center.lat + height * 0.14, center.lng + width * 0.03];
  }
  if (kind === 'representative_feature') {
    return [center.lat + height * 0.08, center.lng + width * 0.03];
  }
  return [center.lat + height * 0.08, center.lng + width * 0.02];
}

function maritimePopupHtml(name, properties, info) {
  const desc = repairText(properties.description || properties.source_note || 'Lớp biển đảo Việt Nam');
  return `
    <div class="xa-popup">
      <div class="xa-header">${escapeHtml(name)}</div>
      <div class="xa-merge">${escapeHtml(desc)}</div>
      ${islandInfoHtml(info)}
    </div>
  `;
}

function fitVietnamFullView() {
  if (!state.map) return;
  state.map.flyToBounds([[6.4, 102.0], [23.5, 117.3]], {
    padding: [24, 24],
    duration: 0.85,
  });
}

function showNationalView() {
  clearCommuneLayer();
  state.selectedProvince = null;
  markActiveProvince();
  state.map.closePopup();
  fitVietnamFullView();
  setStatus('Đang xem toàn quốc. Việt Nam được tô nổi bật; các nước lân cận chỉ hiển thị phụ để phân biệt lãnh thổ.');
}

function clearCommuneLayer() {
  if (state.communeLayer) state.map.removeLayer(state.communeLayer);
  if (state.communeLabelLayer) state.map.removeLayer(state.communeLabelLayer);
  state.communeLayer = null;
  state.communeLabelLayer = null;
}

function renderProvinceList(items = []) {
  const safeItems = Array.isArray(items) ? items : [];
  const list = el('province-list');
  list.innerHTML = safeItems.map(province => `
    <button class="province" type="button" data-code="${escapeHtml(province.code)}">
      ${escapeHtml(displayProvinceName(province))}
      <small>${escapeHtml(province.region || '')}</small>
    </button>
  `).join('');

  Array.from(list.querySelectorAll('[data-code]')).forEach(button => {
    button.addEventListener('click', () => chooseProvince(button.dataset.code));
  });

  markActiveProvince();
}

function markActiveProvince() {
  const selected = state.selectedProvince?.code || '';
  Array.from(document.querySelectorAll('.province[data-code]')).forEach(button => {
    button.classList.toggle('active', button.dataset.code === selected);
  });
}

function filterProvinceList(query) {
  const q = normalize(query);
  const items = q
    ? state.provinces.filter(province => normalize([
      province.code,
      province.name,
      province.full_name,
      province.region,
      ...(province.merged_from || []),
    ].join(' ')).includes(q))
    : state.provinces;
  renderProvinceList(items);
}

function requestedProvinceCode() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('province') || params.get('code') || '';
    return raw ? String(raw).padStart(2, '0') : '';
  } catch (_error) {
    return '';
  }
}

function requestedMapMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    const value = String(params.get('view') || params.get('mode') || '').toLowerCase();
    return value === 'national' ? 'national' : '';
  } catch (_error) {
    return '';
  }
}

function refreshMapSize() {
  if (!state.map || typeof state.map.invalidateSize !== 'function') return;
  window.setTimeout(() => state.map.invalidateSize({ pan: false }), 0);
  window.setTimeout(() => state.map.invalidateSize({ pan: false }), 250);
}

function initMap() {
  state.map = L.map('map', {
    minZoom: 5,
    maxZoom: 18,
    zoomControl: true,
    attributionControl: false,
    preferCanvas: true,
  }).setView([16.0, 108.0], 6);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    subdomains: 'abcd',
  }).addTo(state.map);

  state.map.createPane('focusPane');
  state.map.getPane('focusPane').style.zIndex = 350;
  state.map.createPane('maritimePane');
  state.map.getPane('maritimePane').style.zIndex = 370;
  state.map.createPane('maritimeLabelPane');
  state.map.getPane('maritimeLabelPane').style.zIndex = 650;
  addVietnamFocusOverlay();
  try {
    addNeighborLabels();
  } catch (error) {
    console.error(error);
  }

  try {
    L.control.scale({ metric: true, imperial: false }).addTo(state.map);
  } catch (error) {
    console.error(error);
  }

  fitVietnamFullView();
}

async function addVietnamFocusOverlay() {
  try {
    const geo = await j('/data/vietnam-focus.geojson');
    state.vietnamFocusLayer = L.geoJSON(geo, {
      pane: 'focusPane',
      interactive: false,
      style: {
        stroke: false,
        fillColor: '#f7d66b',
        fillOpacity: 0.5,
      },
    }).addTo(state.map);
  } catch (error) {
    console.warn('Không tải được lớp tô Việt Nam', error);
  }
}

function addNeighborLabels() {
  const labels = [
    { name: 'TRUNG QUỐC / CHINA', lat: 23.1, lng: 108.1 },
    { name: 'LÀO / LAOS', lat: 18.3, lng: 103.2 },
    { name: 'CAMPUCHIA / CAMBODIA', lat: 12.3, lng: 104.2 },
    { name: 'BIỂN ĐÔNG / EAST SEA', lat: 13.4, lng: 113.6, sea: true },
  ];
  const group = L.layerGroup();

  labels.forEach(item => {
    L.marker([item.lat, item.lng], {
      interactive: false,
      icon: L.divIcon({
        className: item.sea ? 'sea-map-label' : 'neighbor-map-label',
        html: item.name,
        iconSize: item.sea ? [220, 28] : [170, 22],
      }),
    }).addTo(group);
  });

  state.neighborLabelLayer = group;
  group.addTo(state.map);
}

function addProvinceLabels() {
  if (state.provinceLabelLayer) state.map.removeLayer(state.provinceLabelLayer);

  const group = L.layerGroup();
  state.provinces.forEach(province => {
    const lat = Number(province.lat);
    const lng = Number(province.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    L.marker([lat, lng], {
      interactive: true,
      icon: L.divIcon({
        className: 'province-map-label',
        html: escapeHtml(displayProvinceName(province)),
        iconSize: [130, 24],
      }),
      keyboard: true,
      title: displayProvinceName(province),
    })
      .on('click', () => chooseProvince(province.code))
      .addTo(group);
  });

  state.provinceLabelLayer = group;
  group.addTo(state.map);
}

function loadProvinceGeo(fileName) {
  if (state.geoCache.has(fileName)) return Promise.resolve(state.geoCache.get(fileName));
  const globalName = `geo_${fileName}`;
  if (window[globalName]) {
    state.geoCache.set(fileName, window[globalName]);
    return Promise.resolve(window[globalName]);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${GEO_BASE}/${fileName}.js`;
    script.charset = 'UTF-8';
    script.async = true;
    script.onload = () => {
      const geo = window[globalName];
      if (!geo) {
        reject(new Error(`Không tìm thấy dữ liệu ${fileName}`));
        return;
      }
      state.geoCache.set(fileName, geo);
      resolve(geo);
    };
    script.onerror = () => reject(new Error(`Không tải được dữ liệu ${fileName}`));
    document.body.appendChild(script);
  });
}

function communeStyle(feature) {
  const code = Number(String(feature?.properties?.ma_xa || '0').replace(/\D/g, '')) || 0;
  const colors = ['#4CAF50', '#66BB6A', '#26A69A', '#81C784', '#43A047', '#2E7D32'];
  return {
    color: '#333',
    weight: 1,
    fillColor: colors[code % colors.length],
    fillOpacity: 0.55,
  };
}

function buildCommunePopup(feature, weather = 'Đang tải thời tiết...') {
  const p = feature.properties || {};
  const title = `${communeType(feature)} ${communeName(feature)}`;
  const merged = repairText(p.sap_nhap || p.tru_so || 'Không rõ');
  const islandInfo = shouldShowIslandInfo(title) ? islandInfoForName(title, p) : null;

  return `
    <div class="xa-popup">
      <div class="xa-header">
        ${escapeHtml(title)}
        <div class="xa-subtitle">${escapeHtml(repairText(p.ten_tinh || state.selectedProvince?.full_name || ''))}</div>
      </div>

      <div class="xa-info">
        <div class="xa-box">
          <div class="xa-label">Diện tích</div>
          <div class="xa-value">${metric(p.dtich_km2, ' km²')}</div>
        </div>
        <div class="xa-box">
          <div class="xa-label">Dân số</div>
          <div class="xa-value">${metric(p.dan_so)}</div>
        </div>
        <div class="xa-box">
          <div class="xa-label">Mật độ</div>
          <div class="xa-value">${metric(p.matdo_km2, '/km²')}</div>
        </div>
        <div class="xa-box">
          <div class="xa-label">Mã xã</div>
          <div class="xa-value">${escapeHtml(p.ma_xa || 'Không rõ')}</div>
        </div>
      </div>

      <div class="xa-merge">
        <b>Sáp nhập từ:</b><br>
        ${escapeHtml(merged).replace(/\n/g, '<br>')}
      </div>

      ${islandInfo ? islandInfoHtml(islandInfo) : ''}

      <div class="xa-weather">${weather}</div>
    </div>
  `;
}

async function getWeather(lat, lng) {
  try {
    const data = await j(`/api/weather?lat=${lat}&lng=${lng}`);
    const current = data.current;
    return `Thời tiết hiện tại<br>${current.temperature_2m}°C · Cảm giác ${current.apparent_temperature}°C · Gió ${current.wind_speed_10m} km/h`;
  } catch (_error) {
    return 'Không lấy được thời tiết trực tuyến';
  }
}

function provinceStatsFromGeo(geo) {
  const features = geo.features || [];
  const area = features.reduce((sum, feature) => {
    const value = Number(feature.properties?.dtich_km2);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const population = features.reduce((sum, feature) => {
    const value = Number(feature.properties?.dan_so);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);
  const density = area > 0 && population > 0 ? population / area : null;

  return {
    communeCount: features.length,
    area,
    population,
    density,
  };
}

function buildProvincePopup(province, stats) {
  const merged = province.merged_from?.length
    ? province.merged_from.map(escapeHtml).join('<br>')
    : 'Không sáp nhập cấp tỉnh';

  return `
    <div class="xa-popup province-popup">
      <div class="xa-header">
        ${escapeHtml(province.full_name)}
        <div class="xa-subtitle">${escapeHtml(province.region || '')}</div>
      </div>

      <div class="xa-info">
        <div class="xa-box">
          <div class="xa-label">Xã/phường</div>
          <div class="xa-value">${fmt(stats.communeCount)}</div>
        </div>
        <div class="xa-box">
          <div class="xa-label">Diện tích</div>
          <div class="xa-value">${stats.area ? `${fmt1(stats.area)} km²` : 'Không rõ'}</div>
        </div>
        <div class="xa-box">
          <div class="xa-label">Dân số</div>
          <div class="xa-value">${stats.population ? fmt(stats.population) : 'Không rõ'}</div>
        </div>
        <div class="xa-box">
          <div class="xa-label">Mật độ</div>
          <div class="xa-value">${stats.density ? `${fmt1(stats.density)}/km²` : 'Không rõ'}</div>
        </div>
      </div>

      <div class="xa-merge">
        <b>Đơn vị sáp nhập:</b><br>
        ${merged}
      </div>

      <div class="xa-weather">
        Click tên xã/phường trên bản đồ để xem chi tiết từng đơn vị.
      </div>
    </div>
  `;
}

async function selectCommuneFeature(feature, layer, latlng = null) {
  const titleText = `${communeType(feature).toLowerCase()} ${communeName(feature)}`;
  setStatus(`Đang xem ${titleText}, ${state.selectedProvince?.full_name || ''}.`);
  const fallback = provinceLatLng(state.selectedProvince) || [16.0, 108.0];
  const center = isValidLatLng(latlng)
    ? latlng
    : safeBoundsCenter(layer?.getBounds?.(), fallback);

  if (!center) {
    setStatus(`Không xác định được vị trí của ${titleText}.`);
    return;
  }

  const weather = await getWeather(center.lat, center.lng);
  layer.setPopupContent(buildCommunePopup(feature, weather));
  layer.openPopup(center);
}

function renderCommunePolygons(geo, province) {
  clearCommuneLayer();

  const fallbackCenter = provinceLatLng(province) || L.latLng(16.0, 108.0);
  const layerGroup = L.geoJSON([], {
    style: communeStyle,
    onEachFeature: (feature, layer) => {
      const title = `${communeType(feature)} ${communeName(feature)}`;
      const center = safeBoundsCenter(layer.getBounds(), fallbackCenter);
      if (!center) return;

      layer.bindTooltip(title, {
        direction: 'top',
        sticky: true,
        className: 'map-tooltip',
      });
      layer.bindPopup(buildCommunePopup(feature));
      layer.on({
        mouseover: event => {
          event.target.setStyle({
            fillOpacity: 0.82,
            color: '#000',
            weight: 2,
          });
          event.target.bringToFront();
        },
        mouseout: event => layerGroup.resetStyle(event.target),
        click: event => selectCommuneFeature(feature, event.target, center),
      });

      L.marker(center, {
        interactive: true,
        icon: L.divIcon({
          className: 'commune-map-label',
          html: escapeHtml(communeName(feature)),
          iconSize: [108, 22],
          iconAnchor: [54, 11],
        }),
        title,
      })
        .on('click', () => selectCommuneFeature(feature, layer, center))
        .addTo(labelGroup);
    },
  });
  const labelGroup = L.layerGroup();

  const features = Array.isArray(geo?.features) ? geo.features : [];
  let count = 0;
  features.forEach(feature => {
    try {
      layerGroup.addData(feature);
      count += 1;
    } catch (error) {
      console.warn('Không hiển thị được một xã/phường', feature?.properties?.ten_xa || feature?.properties?.name || '', error);
    }
  });

  state.communeLayer = layerGroup;
  state.communeLabelLayer = labelGroup;
  layerGroup.addTo(state.map);
  labelGroup.addTo(state.map);

  const bounds = layerGroup.getBounds();
  const center = safeBoundsCenter(bounds, fallbackCenter) || fallbackCenter;
  if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
    state.map.flyToBounds(bounds, {
      padding: [24, 24],
      duration: 0.85,
    });
  } else {
    state.map.setView(center, Math.max(state.map.getZoom(), 11), {
      animate: true,
      duration: 0.85,
    });
  }

  return {
    count,
    bounds,
    center,
  };
}

async function chooseProvince(code) {
  const province = state.provinceByCode.get(code);
  const fileName = provinceFiles[code];
  if (!province || !fileName) {
    setStatus('Không có dữ liệu bản đồ cho tỉnh/thành này.');
    return;
  }

  state.selectedProvince = province;
  markActiveProvince();
  setLoading(true, `Đang tải ${province.full_name}...`);
  setStatus(`Đang tải bản đồ xã/phường của ${province.full_name}.`);

  try {
    const geo = await loadProvinceGeo(fileName);
    const stats = provinceStatsFromGeo(geo);
    const rendered = renderCommunePolygons(geo, province);
    const center = rendered.center || provinceLatLng(province) || L.latLng(16.0, 108.0);
    L.popup()
      .setLatLng(center)
      .setContent(buildProvincePopup(province, stats))
      .openOn(state.map);
    setStatus(`Đã hiển thị ${fmt(rendered.count)} xã/phường của ${province.full_name}. Click trực tiếp từng vùng hoặc tên xã/phường để xem chi tiết.`);
  } catch (error) {
    console.error(error);
    clearCommuneLayer();
    setStatus(`Không tải được dữ liệu xã/phường của ${province.full_name}. ${error?.message ? `Chi tiết: ${error.message}` : ''}`.trim());
  } finally {
    setLoading(false);
  }
}

async function addMaritimeLayer() {
  try {
    clearMaritimeLayer();
    const geo = await j('/data/maritime-features.geojson');
    const labelGroup = L.layerGroup();

    geo.features.forEach(feature => {
      const p = feature.properties || {};
      const name = repairText(p.name || 'Biển đảo Việt Nam');
      const kind = p.kind || '';
      const bounds = featureBounds(feature);
      const labelPoint = maritimeLabelPoint(feature, bounds);
      if (!labelPoint) return;
      const islandInfo = islandInfoForName(name, p);
      const popupHtml = maritimePopupHtml(name, p, islandInfo);

      const labelSize = maritimeLabelSize(name);
      L.marker(labelPoint, {
        pane: 'maritimeLabelPane',
        interactive: true,
        keyboard: true,
        icon: L.divIcon({
          className: maritimeLabelClass(kind),
          html: escapeHtml(name),
          iconSize: labelSize,
          iconAnchor: [Math.round(labelSize[0] / 2), 9],
        }),
        title: name,
        })
        .on('click', () => L.popup().setLatLng(labelPoint).setContent(popupHtml).openOn(state.map))
        .addTo(labelGroup);
    });

    state.maritimeLayer = labelGroup.addTo(state.map);
  } catch (error) {
    console.warn('Không tải được lớp biển đảo', error);
  }
}

function locateUser() {
  if (!navigator.geolocation) {
    setStatus('Trình duyệt không hỗ trợ định vị.');
    return;
  }

  setLoading(true, 'Đang lấy vị trí...');
  navigator.geolocation.getCurrentPosition(position => {
    const latlng = [position.coords.latitude, position.coords.longitude];
    if (state.locationMarker) state.map.removeLayer(state.locationMarker);
    state.locationMarker = L.marker(latlng, {
      icon: L.divIcon({
        className: 'location-label',
        html: 'Vị trí',
        iconSize: [70, 28],
        iconAnchor: [35, 28],
      }),
    }).addTo(state.map);
    state.locationMarker.bindPopup(`
      <div class="xa-popup">
        <div class="xa-header">Vị trí hiện tại</div>
        <div class="xa-merge">Độ chính xác khoảng ${fmt(Math.round(position.coords.accuracy || 0))} m</div>
        <div class="xa-weather">Đã định vị</div>
      </div>
    `).openPopup();
    state.map.flyTo(latlng, Math.max(state.map.getZoom(), 12), { duration: 0.85 });
    setStatus('Đã đưa bản đồ về vị trí hiện tại.');
    setLoading(false);
  }, () => {
    setStatus('Không lấy được vị trí hiện tại.');
    setLoading(false);
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000,
  });
}

function goHome() {
  window.top.location.href = '/python/index.html';
}

function bindEvents() {
  el('home-btn').addEventListener('click', goHome);
  el('province-search').addEventListener('input', event => filterProvinceList(event.target.value));
  el('full-view-btn').addEventListener('click', showNationalView);
  el('locate-btn').addEventListener('click', locateUser);
  window.addEventListener('resize', refreshMapSize);
  window.addEventListener('message', event => {
    const data = event.data || {};
    if (data.type === 'invalidateSize') {
      refreshMapSize();
    }
    if (data.type === 'selectProvince' && data.code) {
      refreshMapSize();
      chooseProvince(String(data.code).padStart(2, '0'));
    }
    if (data.type === 'showNationalView') {
      refreshMapSize();
      showNationalView();
    }
  });
}

async function init() {
  setLoading(true);
  const data = await j('/api/provinces');
  state.provinces = Array.isArray(data.items) ? data.items.map(repairProvince) : [];
  state.provinces.forEach(province => state.provinceByCode.set(province.code, province));

  initMap();
  try {
    renderProvinceList(state.provinces);
  } catch (error) {
    console.error(error);
    setStatus('Không hiển thị được danh sách tỉnh/thành.');
  }

  try {
    addProvinceLabels();
  } catch (error) {
    console.error(error);
    setStatus('Không hiển thị được nhãn tỉnh/thành trên bản đồ.');
  }

  try {
    bindEvents();
  } catch (error) {
    console.error(error);
    setStatus('Không gắn được sự kiện điều khiển bản đồ.');
  }

  await addMaritimeLayer();
  if (requestedMapMode() === 'national') {
    setLoading(false);
    showNationalView();
    return;
  }
  const initialProvinceCode = requestedProvinceCode() || DEFAULT_PROVINCE_CODE;
  if (state.provinceByCode.has(initialProvinceCode)) {
    await chooseProvince(initialProvinceCode);
  } else {
    setLoading(false);
    showNationalView();
  }
}

init().catch(error => {
  console.error(error);
  setLoading(false);
  setStatus(`Không khởi tạo được bản đồ. ${error?.message ? `Chi tiết: ${error.message}` : ''}`.trim());
});
