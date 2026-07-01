# Fish Breeding System - FishSync

Dự án Hệ thống quản lý và bán cá giống **FishSync** bao gồm:
- **Frontend**: Next.js 14 (App Router, TailwindCSS v4, TypeScript)
- **Backend**: Spring Boot 3 (Java 17, Spring Data JPA, Redis Cache, Maven)
- **Database**: PostgreSQL 15 & Redis 7
- **Tích hợp bên thứ 3**: VNPay Sandbox (Thanh toán), Giao Hàng Nhanh - GHN (Vận chuyển), Google OAuth (Đăng nhập).

---

## 📌 Yêu cầu hệ thống trước khi cài đặt

- **Java Development Kit (JDK)**: Phiên bản 17 trở lên
- **Node.js**: Phiên bản 18 trở lên & **npm**
- **Maven**: Phiên bản 3.x (hoặc dùng `mvnw` tích hợp sẵn trong backend)
- **Docker & Docker Compose**: Để chạy nhanh toàn bộ dự án hoặc chạy Database/Redis.

---

## 📦 Hướng dẫn sau khi giải nén file ZIP (Nén tối ưu)

Để giảm dung lượng khi nén/gửi file ZIP, các thư mục dependencies và build cache nặng như `node_modules` (ở frontend) và `target` (ở backend) đã được xóa bỏ. Sau khi bạn giải nén file ZIP, hãy thực hiện một trong hai cách dưới đây để hệ thống tự động tải lại các thư viện và chạy chương trình:

---

## 🚀 Cách 1: Khởi chạy nhanh bằng Docker Compose (Không cần tải thư viện thủ công)

Nếu máy của bạn đã cài sẵn **Docker Desktop**, bạn chỉ cần chạy lệnh sau tại thư mục gốc (nơi chứa file `docker-compose.yml`):

```bash
docker-compose up --build
```
*Docker sẽ tự động tải toàn bộ dependencies của Maven và npm trong quá trình build container mà bạn không cần chạy lệnh tải thủ công.*

Khi khởi động thành công:
- **Giao diện Khách hàng (Frontend)**: [http://localhost:3000](http://localhost:3000)
- **Cổng API (Backend)**: [http://localhost:8080](http://localhost:8080)
- **PostgreSQL Database**: `localhost:5432` (Username/Password: `postgres`/`postgres`)
- **Redis Cache**: `localhost:6379`

---

## 💻 Cách 2: Khởi chạy môi trường phát triển (Development Mode)

Chạy cơ sở dữ liệu trên Docker và chạy độc lập Backend, Frontend trên môi trường máy local (yêu cầu máy có sẵn JDK 17+, Node.js 18+, Maven).

### Bước 1: Khởi động PostgreSQL và Redis
Tại thư mục gốc của dự án, khởi chạy các container database:
```bash
docker-compose up -d db redis
```

### Bước 2: Cài đặt và chạy Backend (fish-shop-be)
1. Di chuyển vào thư mục backend:
   ```bash
   cd fish-shop-be
   ```
2. Tạo file `.env` tại thư mục `fish-shop-be` (nếu chưa có) và cấu hình các thông số kết nối:
   ```env
   # Database
   DB_URL=jdbc:postgresql://localhost:5432/fish_db
   DB_USERNAME=postgres
   DB_PASSWORD=postgres

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # JWT Secret Key
   JWT_SECRET=Zmlyc2gtYnJlZWRpbmctc3lzdGVtLXN1cGVyLXNlY3VyZS1qd3Qta2V5LWNoYW5nZS1pbi1wcm9k

   # VNPay Configuration (Sandbox)
   VNPAY_TMN_CODE=TL651GVC
   VNPAY_HASH_SECRET=JSL6NDM4WVY1YYJR7IDKIFL8I94ZDGMI
   VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
   VNPAY_RETURN_URL=http://localhost:8083/api/customer/checkout/vnpay/return
   VNPAY_FRONTEND_RETURN_URL=http://localhost:3001/checkout/vnpay-return
   ```
3. Biên dịch và chạy ứng dụng Spring Boot:
   ```bash
   # Lệnh này tự động tải tất cả các thư viện trong pom.xml (nếu chưa có) và khởi động Backend
   mvn spring-boot:run
   ```
   *Backend chạy ở chế độ dev local tại cổng:* **`http://localhost:8083`**

---

### Bước 3: Cài đặt và chạy Frontend (fish-shop-fe)
1. Di chuyển vào thư mục frontend:
   ```bash
   cd ../fish-shop-fe
   ```
2. Tạo file `.env.local` tại thư mục `fish-shop-fe` (nếu chưa có) và cấu hình kết nối tới API Backend và NextAuth:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8083
   NEXTAUTH_URL=http://localhost:3001
   NEXTAUTH_SECRET=FishSyncSecretKey2026MienPhiHoanToan

   # Đăng nhập Google (Tùy chọn)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```
3. Cài đặt các thư viện phụ thuộc:
   ```bash
   # Tải và cài đặt toàn bộ thư viện trong package.json vào thư mục node_modules
   npm install
   ```
4. Khởi chạy Next.js ở chế độ phát triển:
   ```bash
   # Khởi chạy Next.js dev server
   npm run dev
   ```
   *Frontend chạy ở chế độ dev local tại cổng:* **`http://localhost:3001`**

---

## 🛠️ Cấu hình Tích hợp bên thứ 3 (Ví dụ & Chạy thử)

### 1. Thanh toán qua VNPay Sandbox
- Bạn có thể thực hiện thanh toán thử nghiệm bằng thẻ test của VNPay Sandbox.
- **Danh sách thẻ test**: [Tài liệu VNPay Sandbox](https://sandbox.vnpayment.vn/apis/list-web-sandbox/)
  - *Ngân hàng*: NCB
  - *Số thẻ*: `9704198526191432119`
  - *Tên chủ thẻ*: `NGUYEN VAN A`
  - *Ngày phát hành*: `07/15`
  - *Mã OTP*: `123456`

### 2. Giao Hàng Nhanh (GHN) API
- Dự án sử dụng API của GHN để tính toán phí vận chuyển tự động dựa trên địa chỉ (Tỉnh/Quận/Phường).
- Mã Token và Shop ID test đã được cấu hình mặc định sẵn trong file `.env` của Backend.

---


