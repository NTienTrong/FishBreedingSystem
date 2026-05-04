# Sửa chức năng Checkout & VNPay Payment

## Phân tích lỗi hiện tại

### 🔴 Lỗi 1: VNPay thiếu credentials (CRITICAL)

Trong file `.env` backend **không có** `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET`. Trong `application.properties`:

```properties
app.vnpay.tmn-code=${VNPAY_TMN_CODE:}   # ← TRỐNG!
app.vnpay.hash-secret=${VNPAY_HASH_SECRET:}  # ← TRỐNG!
```

Kết quả: hàm `hasCredentials()` trả về `false` → `buildPaymentUrl()` trả về `null` → Không tạo được link thanh toán VNPay.

> [!CAUTION]
> **Thiếu 2 key quan trọng nhất:**
> - `VNPAY_TMN_CODE` – Mã Terminal (lấy từ VNPay Sandbox)
> - `VNPAY_HASH_SECRET` – Khóa bí mật để ký giao dịch
> 
> Bạn cần đăng ký VNPay Sandbox tại https://sandbox.vnpayment.vn và thêm 2 key này vào file `.env`.

### 🔴 Lỗi 2: Cart `clear()` không chờ xong trước khi redirect

Trong `handleConfirmOrder`:
```ts
await clear(); // ← clear() là fire-and-forget (void), KHÔNG trả về Promise!
```

Hàm `clear()` trong `CartContext` gọi `fetch("/api/customer/cart", { method: "DELETE" })` bên trong `void (async () => { ... })()` → **Không trả về Promise** → `await clear()` thực chất **không chờ gì cả**.

### 🔴 Lỗi 3: VNPay Return Page - searchParams phải `await` (Next.js 15+)

Trong Next.js 15, `searchParams` là **async** và phải `await`. Hiện tại code dùng trực tiếp mà không `await`:
```tsx
export default function VnpayReturnPage({ searchParams }: VnpayReturnPageProps) {
  const status = searchParams?.status; // ← Cần await searchParams
```

### 🟡 Lỗi 4: SecurityConfig `.anyRequest().permitAll()`

Endpoint `/api/customer/checkout/vnpay` dùng `Principal principal` nhưng security config cho phép `anyRequest().permitAll()` - vậy thì JWT sẽ vẫn được resolve nếu có, nhưng không bắt buộc. Nếu token không hợp lệ hoặc hết hạn, `principal` sẽ `null` → endpoint throw `BadRequestException("Unauthorized")`.

Phần này **hoạt động được** nhưng nên thêm `.requestMatchers("/api/customer/**").authenticated()` để chặt chẽ hơn.

---

## Proposed Changes

### 1. Backend – Thêm VNPay Sandbox Keys vào `.env`

#### [MODIFY] [.env](file:///d:/code/fish-breeding-system/fish-shop-be/.env)
- Thêm `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET` (VNPay Sandbox test keys)

---

### 2. Frontend – Sửa `clear()` trong CartContext để trả về Promise

#### [MODIFY] [CartContext.tsx](file:///d:/code/fish-breeding-system/fish-shop-fe/src/components/customer/cart/CartContext.tsx)
- Sửa hàm `clear()` trả về `Promise<void>` thay vì fire-and-forget
- Cập nhật type `CartContextValue`

---

### 3. Frontend – Thiết kế lại trang Checkout hoàn chỉnh

#### [MODIFY] [page.tsx](file:///d:/code/fish-breeding-system/fish-shop-fe/src/app/%28customer%29/checkout/page.tsx)

Thiết kế lại toàn bộ checkout form theo yêu cầu:

**Section 1: Thông tin người nhận (Shipping Information)**
- Họ và tên (Input Text) - Required
- Số điện thoại (Input, validation 10 số) - Required
- Tỉnh/Thành phố → Quận/Huyện → Phường/Xã (Cascading Select từ JSON data)
- Địa chỉ chi tiết (Textarea) - Required

**Section 2: Phương thức thanh toán (Payment Methods)**
- COD (Radio) - Logo + mô tả
- VNPay (Radio) - Logo VNPay + "Thanh toán qua thẻ ATM, QR Code hoặc Ví điện tử"

**Section 3: Tóm tắt đơn hàng (Order Summary)**
- Danh sách sản phẩm: Ảnh thu nhỏ, tên cá, số lượng, đơn giá
- Tiền hàng (subtotal)
- Phí vận chuyển
- **Tổng thanh toán** (tổng cuối cùng gửi sang VNPay)

**Section 4: Ghi chú đơn hàng**
- Textarea với placeholder rõ ràng cho lĩnh vực cá giống

---

### 4. Frontend – Tạo file JSON dữ liệu Tỉnh/Quận/Phường Việt Nam

#### [NEW] [vietnam-provinces.ts](file:///d:/code/fish-breeding-system/fish-shop-fe/src/data/vietnam-provinces.ts)
- Dữ liệu cascading đầy đủ hơn cho 63 tỉnh/thành phố (hoặc ít nhất các thành phố lớn phổ biến)

---

### 5. Frontend – Sửa VNPay Return Page cho Next.js 15

#### [MODIFY] [page.tsx](file:///d:/code/fish-breeding-system/fish-shop-fe/src/app/%28customer%29/checkout/vnpay-return/page.tsx)
- Thêm `await` cho `searchParams` (Next.js 15 async requirement)

---

## Open Questions

> [!IMPORTANT]
> **Bạn đã có VNPay Sandbox credentials chưa?**
> - Nếu có: cho tôi `TMN_CODE` và `HASH_SECRET` để thêm vào `.env`
> - Nếu chưa: Tôi sẽ thêm VNPay Sandbox mặc định (test keys), bạn có thể đổi sau
>
> **Đăng ký VNPay Sandbox:** https://sandbox.vnpayment.vn/apis/vnpay-demo/

> [!NOTE]
> Dữ liệu Tỉnh/Quận/Phường: Tôi sẽ tạo file JSON tĩnh với các tỉnh/thành phố lớn phổ biến nhất. Nếu cần đầy đủ 63 tỉnh thành có thể tích hợp API GiaoHangNhanh sau.

## Verification Plan

### Automated Tests
- Build frontend: `npm run build` để kiểm tra không có lỗi TypeScript
- Kiểm tra backend khởi động bình thường với VNPay config mới

### Manual Verification  
- Mở trang checkout, kiểm tra form hiển thị đúng layout
- Test cascading dropdown Tỉnh/Quận/Phường
- Test validation form (để trống, SĐT sai format)
- Test đặt hàng COD
- Test đặt hàng VNPay (redirect đến VNPay Sandbox)
