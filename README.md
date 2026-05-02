# Vietnam admin map full dataset + real boundaries

Bản này dùng:
- `vietnam-address-database` cho **34 tỉnh/thành**, **3.321 xã/phường/đặc khu**, **10.977 mapping cũ → mới**
- **Nominatim / OpenStreetMap** để tải **ranh giới thật theo yêu cầu**
- **Open-Meteo** để lấy **thời tiết hiện tại**
- **Turf.js** để tính **diện tích từ polygon**

## Có gì trong bản này
- Dropdown đầy đủ tỉnh/thành và xã/phường theo hệ thống mới từ 01/07/2025
- Tra cứu xã cũ → xã mới
- Chọn tỉnh: khoanh ranh giới thật cấp tỉnh
- Chọn xã/phường: ưu tiên khoanh ranh giới thật cấp xã
- Với đơn vị mới sau sáp nhập, app sẽ cố gắng **ghép ranh giới từ các đơn vị cũ**
- Diện tích tính trực tiếp từ polygon đã tải
- Dân số/mật độ hiển thị khi dịch vụ ranh giới có trả về trường population
- Thời tiết realtime theo tâm hình học của polygon đang xem

## Lưu ý quan trọng
- Ranh giới được gọi **trực tuyến** từ dịch vụ bản đồ, nên máy chạy app phải có Internet.
- Dữ liệu ranh giới trên OSM/Nominatim có thể chưa đồng bộ hoàn toàn với mốc sáp nhập 2025 cho mọi đơn vị. Vì vậy app có fallback ghép từ đơn vị cũ.
- Dân số không phải lúc nào cũng có trong dữ liệu ranh giới. Khi không có, app vẫn tính diện tích và lấy thời tiết bình thường.
- Nếu bạn muốn khai báo email khi gọi Nominatim cho đúng usage policy, có thể đặt biến môi trường `NOMINATIM_EMAIL` trước khi chạy server.

## Chạy
```powershell
cd vietnam-map-full-dataset-source
npm install
npm start
```

Mở trình duyệt:
```text
http://localhost:9000
```

## Khai báo email cho Nominatim (khuyên dùng)
```powershell
$env:NOMINATIM_EMAIL="ban@example.com"
npm start
```


## Bổ sung Hoàng Sa, Trường Sa và biển đảo

Bản này có thêm file `public/data/maritime-features.geojson` để hiển thị:
- Quần đảo Hoàng Sa
- Quần đảo Trường Sa
- Một số đảo/quần đảo tiêu biểu: Phú Quốc, Côn Đảo, Lý Sơn, Cát Bà, Bạch Long Vĩ, Cồn Cỏ, Cù Lao Chàm, Phú Quý, Nam Du, Thổ Chu

Lưu ý: lớp biển đảo này dùng khung bao/vòng khoanh tham khảo để hiển thị đầy đủ trên bản đồ web, không phải đường biên pháp lý hay hải giới chính thức. Khi có GeoJSON/Shapefile chính thức chi tiết hơn, thay thế trực tiếp file `maritime-features.geojson`.


## Cập nhật theo bản đồ hành chính Việt Nam người dùng cung cấp

Phiên bản này chỉnh giao diện bản đồ theo phong cách bản đồ hành chính:
- Nền bản đồ không nhãn để không hiện chữ nước ngoài ngoài tiếng Việt/English.
- Ứng dụng tự vẽ nhãn tiếng Việt/English cho tỉnh/thành, biển đảo, quốc gia lân cận và Biển Đông/East Sea.
- Có lưới kinh tuyến/vĩ tuyến.
- Có lớp Hoàng Sa, Trường Sa và các đảo tiêu biểu.
- Có nút xem toàn lãnh thổ để bao quát phần đất liền, Hoàng Sa, Trường Sa và đảo xa.

Lưu ý: nền không nhãn giúp tránh hiển thị các ngôn ngữ khác. Ranh giới hành chính vẫn được tải động từ dịch vụ trực tuyến khi người dùng chọn tỉnh/xã.
