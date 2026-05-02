from __future__ import annotations

import argparse
import json
import mimetypes
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PUBLIC_DIR = ROOT / "public"
PYTHON_APP_INDEX = PUBLIC_DIR / "python" / "index.html"
MAP_INDEX = PUBLIC_DIR / "index.html"


PROVINCES = [
    {"code": "01", "name": "Hà Nội", "type": "Thành phố", "region": "Đồng bằng sông Hồng", "lat": 21.0285, "lng": 105.8542, "merged_from": [], "capital": "Hà Nội"},
    {"code": "04", "name": "Cao Bằng", "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "lat": 22.6666, "lng": 106.2570, "merged_from": [], "capital": "Cao Bằng"},
    {"code": "08", "name": "Tuyên Quang", "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "lat": 21.8230, "lng": 105.2181, "merged_from": ["Hà Giang", "Tuyên Quang"], "capital": "Tuyên Quang"},
    {"code": "11", "name": "Lạng Sơn", "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "lat": 21.8478, "lng": 106.7578, "merged_from": [], "capital": "Lạng Sơn"},
    {"code": "12", "name": "Thái Nguyên", "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "lat": 21.5942, "lng": 105.8482, "merged_from": ["Bắc Kạn", "Thái Nguyên"], "capital": "Thái Nguyên"},
    {"code": "14", "name": "Quảng Ninh", "type": "Tỉnh", "region": "Đồng bằng sông Hồng", "lat": 21.0064, "lng": 107.2925, "merged_from": [], "capital": "Hạ Long"},
    {"code": "19", "name": "Bắc Ninh", "type": "Tỉnh", "region": "Đồng bằng sông Hồng", "lat": 21.1214, "lng": 106.1111, "merged_from": ["Bắc Giang", "Bắc Ninh"], "capital": "Bắc Ninh"},
    {"code": "20", "name": "Hải Phòng", "type": "Thành phố", "region": "Đồng bằng sông Hồng", "lat": 20.8449, "lng": 106.6881, "merged_from": ["Hải Dương", "Hải Phòng"], "capital": "Hải Phòng"},
    {"code": "22", "name": "Hưng Yên", "type": "Tỉnh", "region": "Đồng bằng sông Hồng", "lat": 20.6464, "lng": 106.0511, "merged_from": ["Hưng Yên", "Thái Bình"], "capital": "Hưng Yên"},
    {"code": "24", "name": "Ninh Bình", "type": "Tỉnh", "region": "Đồng bằng sông Hồng", "lat": 20.2506, "lng": 105.9745, "merged_from": ["Hà Nam", "Nam Định", "Ninh Bình"], "capital": "Ninh Bình"},
    {"code": "25", "name": "Phú Thọ", "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "lat": 21.3980, "lng": 105.1619, "merged_from": ["Hòa Bình", "Phú Thọ", "Vĩnh Phúc"], "capital": "Việt Trì"},
    {"code": "26", "name": "Lào Cai", "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "lat": 22.4809, "lng": 103.9755, "merged_from": ["Lào Cai", "Yên Bái"], "capital": "Lào Cai"},
    {"code": "30", "name": "Điện Biên", "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "lat": 21.3860, "lng": 103.0230, "merged_from": [], "capital": "Điện Biên Phủ"},
    {"code": "31", "name": "Lai Châu", "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "lat": 22.3964, "lng": 103.4582, "merged_from": [], "capital": "Lai Châu"},
    {"code": "33", "name": "Sơn La", "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "lat": 21.3280, "lng": 103.9144, "merged_from": [], "capital": "Sơn La"},
    {"code": "36", "name": "Thanh Hóa", "type": "Tỉnh", "region": "Bắc Trung Bộ và Duyên hải miền Trung", "lat": 19.8067, "lng": 105.7852, "merged_from": [], "capital": "Thanh Hóa"},
    {"code": "38", "name": "Nghệ An", "type": "Tỉnh", "region": "Bắc Trung Bộ và Duyên hải miền Trung", "lat": 18.6796, "lng": 105.6813, "merged_from": [], "capital": "Vinh"},
    {"code": "40", "name": "Hà Tĩnh", "type": "Tỉnh", "region": "Bắc Trung Bộ và Duyên hải miền Trung", "lat": 18.3428, "lng": 105.9057, "merged_from": [], "capital": "Hà Tĩnh"},
    {"code": "42", "name": "Quảng Trị", "type": "Tỉnh", "region": "Bắc Trung Bộ và Duyên hải miền Trung", "lat": 16.7403, "lng": 107.1855, "merged_from": ["Quảng Bình", "Quảng Trị"], "capital": "Đồng Hới"},
    {"code": "44", "name": "Huế", "type": "Thành phố", "region": "Bắc Trung Bộ và Duyên hải miền Trung", "lat": 16.4637, "lng": 107.5909, "merged_from": [], "capital": "Huế"},
    {"code": "46", "name": "Đà Nẵng", "type": "Thành phố", "region": "Bắc Trung Bộ và Duyên hải miền Trung", "lat": 16.0544, "lng": 108.2022, "merged_from": ["Đà Nẵng", "Quảng Nam"], "capital": "Đà Nẵng"},
    {"code": "48", "name": "Quảng Ngãi", "type": "Tỉnh", "region": "Bắc Trung Bộ và Duyên hải miền Trung", "lat": 15.1214, "lng": 108.8044, "merged_from": ["Kon Tum", "Quảng Ngãi"], "capital": "Quảng Ngãi"},
    {"code": "51", "name": "Gia Lai", "type": "Tỉnh", "region": "Tây Nguyên", "lat": 13.8079, "lng": 108.1094, "merged_from": ["Bình Định", "Gia Lai"], "capital": "Pleiku"},
    {"code": "56", "name": "Khánh Hòa", "type": "Tỉnh", "region": "Bắc Trung Bộ và Duyên hải miền Trung", "lat": 12.2388, "lng": 109.1967, "merged_from": ["Khánh Hòa", "Ninh Thuận"], "capital": "Nha Trang"},
    {"code": "66", "name": "Đắk Lắk", "type": "Tỉnh", "region": "Tây Nguyên", "lat": 12.6667, "lng": 108.0500, "merged_from": ["Đắk Lắk", "Phú Yên"], "capital": "Buôn Ma Thuột"},
    {"code": "68", "name": "Lâm Đồng", "type": "Tỉnh", "region": "Tây Nguyên", "lat": 11.9404, "lng": 108.4583, "merged_from": ["Đắk Nông", "Lâm Đồng", "Bình Thuận"], "capital": "Đà Lạt"},
    {"code": "75", "name": "Đồng Nai", "type": "Tỉnh", "region": "Đông Nam Bộ", "lat": 10.9453, "lng": 106.8240, "merged_from": [], "capital": "Biên Hòa"},
    {"code": "79", "name": "Hồ Chí Minh", "type": "Thành phố", "region": "Đông Nam Bộ", "lat": 10.7769, "lng": 106.7009, "merged_from": ["Bà Rịa - Vũng Tàu", "Bình Dương", "Hồ Chí Minh"], "capital": "Hồ Chí Minh"},
    {"code": "80", "name": "Tây Ninh", "type": "Tỉnh", "region": "Đông Nam Bộ", "lat": 11.3104, "lng": 106.0983, "merged_from": ["Long An", "Tây Ninh"], "capital": "Tây Ninh"},
    {"code": "82", "name": "Đồng Tháp", "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "lat": 10.4938, "lng": 105.6882, "merged_from": ["Đồng Tháp", "Tiền Giang"], "capital": "Mỹ Tho"},
    {"code": "86", "name": "Vĩnh Long", "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "lat": 10.2537, "lng": 105.9722, "merged_from": ["Bến Tre", "Trà Vinh", "Vĩnh Long"], "capital": "Vĩnh Long"},
    {"code": "91", "name": "An Giang", "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "lat": 10.5216, "lng": 105.1259, "merged_from": ["An Giang", "Kiên Giang"], "capital": "Long Xuyên"},
    {"code": "92", "name": "Cần Thơ", "type": "Thành phố", "region": "Đồng bằng sông Cửu Long", "lat": 10.0452, "lng": 105.7469, "merged_from": ["Cần Thơ", "Hậu Giang", "Sóc Trăng"], "capital": "Cần Thơ"},
    {"code": "96", "name": "Cà Mau", "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "lat": 9.1769, "lng": 105.1524, "merged_from": ["Bạc Liêu", "Cà Mau"], "capital": "Cà Mau"},
]

for province in PROVINCES:
    province["full_name"] = f"{province['type']} {province['name']}"
    province["merged"] = bool(province["merged_from"])

PROVINCE_BY_CODE = {province["code"]: province for province in PROVINCES}


def normalize(value: str) -> str:
    text = unicodedata.normalize("NFD", str(value or "").lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    return text.replace("đ", "d").strip()


def json_response(handler: BaseHTTPRequestHandler, payload: object, status: int = 200) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)


def serve_file(handler: BaseHTTPRequestHandler, path: Path) -> None:
    if not path.exists() or not path.is_file():
        handler.send_error(404, "File not found")
        return

    content_type = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    data = path.read_bytes()
    handler.send_response(200)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(data)))
    if path.suffix.lower() in {".html", ".css", ".js", ".json", ".geojson"}:
        handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(data)


def safe_public_path(url_path: str) -> Path | None:
    relative = urllib.parse.unquote(url_path).lstrip("/")
    candidate = (PUBLIC_DIR / relative).resolve()
    try:
        candidate.relative_to(PUBLIC_DIR.resolve())
    except ValueError:
        return None
    if candidate.is_dir():
        candidate = candidate / "index.html"
    return candidate


class VietnamLearningHandler(BaseHTTPRequestHandler):
    server_version = "VietnamLearningPython/1.0"

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == "/":
            serve_file(self, PYTHON_APP_INDEX)
            return
        if path == "/map":
            serve_file(self, MAP_INDEX)
            return
        if path == "/api/summary":
            json_response(self, {
                "province_count": len(PROVINCES),
                "commune_count_official": 3321,
                "source": "Python rewrite from Scratch content and existing VN map project",
                "effective_from": "2025-07-01",
            })
            return
        if path == "/api/provinces":
            q = normalize(query.get("q", [""])[0])
            items = PROVINCES
            if q:
                items = [
                    province for province in PROVINCES
                    if q in normalize(" ".join([
                        province["code"],
                        province["name"],
                        province["full_name"],
                        province["region"],
                        " ".join(province["merged_from"]),
                    ]))
                ]
            json_response(self, {"total": len(items), "items": items})
            return
        if path.startswith("/api/provinces/"):
            code = path.rsplit("/", 1)[-1].zfill(2)
            province = PROVINCE_BY_CODE.get(code)
            if not province:
                json_response(self, {"message": "Không tìm thấy tỉnh/thành."}, 404)
                return
            json_response(self, province)
            return
        if path == "/api/weather":
            self.handle_weather(query)
            return

        static_path = safe_public_path(path)
        if static_path is None:
            self.send_error(403, "Forbidden")
            return
        serve_file(self, static_path)

    def handle_weather(self, query: dict[str, list[str]]) -> None:
        try:
            lat = float(query.get("lat", [""])[0])
            lng = float(query.get("lng", [""])[0])
        except ValueError:
            json_response(self, {"message": "Tọa độ không hợp lệ."}, 400)
            return

        params = urllib.parse.urlencode({
            "latitude": lat,
            "longitude": lng,
            "current": "temperature_2m,apparent_temperature,wind_speed_10m",
            "timezone": "auto",
        })
        url = f"https://api.open-meteo.com/v1/forecast?{params}"
        try:
            with urllib.request.urlopen(url, timeout=8) as response:
                payload = json.loads(response.read().decode("utf-8"))
            json_response(self, payload)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
            json_response(self, {"message": "Không lấy được thời tiết trực tuyến.", "detail": str(error)}, 502)

    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.address_string()} - {format % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Python version of the Vietnam learning map app.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=9100, type=int)
    args = parser.parse_args()

    address = (args.host, args.port)
    httpd = ThreadingHTTPServer(address, VietnamLearningHandler)
    print(f"Python app: http://{args.host}:{args.port}")
    print(f"Map view:   http://{args.host}:{args.port}/map")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
