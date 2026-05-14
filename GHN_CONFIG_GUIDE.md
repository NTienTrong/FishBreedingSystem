# Hướng Dẫn Xác Minh Cấu Hình GHN

## 1. Vấn Đề Hiện Tại
- Lỗi WARN: `GHN fee missing fromDistrictId or wardCode`
- Nguyên nhân: `ghn.from-district-id=0` (không hợp lệ) hoặc `ghn.from-ward-code` chưa được cấu hình

## 2. Cấu Hình Đã Sửa
```properties
ghn.from-district-id=205        # Tiên Du, Bắc Ninh
ghn.from-ward-code=20540100     # Thị trấn Lim (Phường Lim)
```

## 3. Các Bước Xác Minh (Optional)

Nếu cần xác minh wardCode chính xác, sử dụng các test endpoint:

### Step 1: Lấy danh sách Tỉnh/Thành Phố
```bash
curl http://localhost:8083/api/public/ghn-test/provinces
```
Tìm **Bắc Ninh** → Ghi nhận `provinceId`

### Step 2: Lấy danh sách Huyện/Quận của Bắc Ninh
```bash
curl http://localhost:8083/api/public/ghn-test/districts?provinceId=2
```
Tìm **Tiên Du** → Ghi nhận `districtId` (thường = 205)

### Step 3: Lấy danh sách Phường/Xã của Tiên Du
```bash
curl http://localhost:8083/api/public/ghn-test/wards?districtId=205
```
Tìm **Lim** hoặc **Thị Trấn Lim** → Ghi nhận `wardCode` (thường = 20540100)

### Step 4: Kiểm Tra Phí Vận Chuyển
```bash
curl -X POST "http://localhost:8083/api/public/ghn-test/shipping-fee?toDistrictId=205&toWardCode=20540100&weight=1000"
```
Nếu trả về phí (không null), cấu hình đúng! ✅

## 4. Địa Chỉ Shop
- **Tỉnh**: Bắc Ninh (ProvinceID: 2)
- **Huyện**: Tiên Du (DistrictID: 205)
- **Phường/Thị Trấn**: Lim (WardCode: 20540100)

## 5. Nếu WardCode Không Chính Xác
Nếu test endpoint step 3 không tìm thấy "Lim", có thể tên khác nhau:
- Phường Lim
- Thị Trấn Lim
- Lim Village

Khi đó, sử dụng wardCode tương ứng từ kết quả.

## 6. Cập Nhật application.properties
```properties
# Cấu hình địa chỉ shop: Thị trấn Lim, Tiên Du, Bắc Ninh
ghn.from-district-id=205
ghn.from-ward-code=<wardCode_từ_step_3>
```

---

**Note**: Sau khi verify xong, có thể xóa test controller `GhnTestController.java` nếu không muốn để trong production.
