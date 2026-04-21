# Fish Breeding System

Đây là dự án bán cá giống sử dụng:
- **Frontend**: Next.js (App Router, TailwindCSS, TypeScript)
- **Backend**: Spring Boot (Java 17, Spring Data JPA, Lombok)
- **Database**: PostgreSQL 15
- **Infrastructure**: Docker & Docker Compose

## Yêu cầu

- [Docker](https://www.docker.com/) và [Docker Compose](https://docs.docker.com/compose/)

## Hướng dẫn chạy (Deployment)

Chạy lệnh sau tại thư mục gốc của dự án (nơi chứa file `docker-compose.yml`):

```bash
docker-compose up --build
```

Sau khi các container đã khởi động thành công:
- **Frontend** sẽ chạy tại: [http://localhost:3000](http://localhost:3000)
- **Backend (API)** sẽ chạy tại: [http://localhost:8080](http://localhost:8080)
- **Postgres Database**: `localhost:5432`

## Lưu ý phát triển

Khi phát triển (Development):
- **Frontend**: vào thư mục `frontend` và chạy `npm run dev` (Yêu cầu Node.js).
- **Backend**: vào thư mục `backend` và chạy bằng Maven hoặc mở bằng IntelliJ IDEA/Eclipse (Dùng cấu hình `application.properties` với `localhost` cho CSDL thay vì `db`).

#database
-- ==========================================================
-- 1. NHÓM NGƯỜI DÙNG (USERS)
-- ==========================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    address TEXT,
    role VARCHAR(20) DEFAULT 'customer', -- 'admin', 'customer'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 2. NHÓM SẢN PHẨM & THUỘC TÍNH (PRODUCTS & ATTRIBUTES)
-- ==========================================================
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE, -- slug để làm URL SEO
    description TEXT,
    parent_id INT REFERENCES categories(category_id) -- Danh mục cha/con
);

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(50) UNIQUE, -- Mã định danh sản phẩm (VD: KOI-001)
    summary TEXT,           -- Mô tả ngắn
    description TEXT,       -- Mô tả chi tiết (HTML)
    price DECIMAL(15, 2) NOT NULL,
    stock_quantity INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian: Một cá có thể thuộc nhiều danh mục (Cá cảnh, Cá giống, Giảm giá...)
CREATE TABLE product_category_map (
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- Bảng quản lý Hình ảnh (Một cá nhiều ảnh)
CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE, -- Ảnh đại diện chính
    sort_order INT DEFAULT 0
);

-- Bảng định nghĩa các thuộc tính sinh học (pH, Nhiệt độ, Độ khó, Thức ăn...)
CREATE TABLE attributes (
    attribute_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Bảng trung gian: Giá trị thuộc tính cụ thể cho từng sản phẩm (Phục vụ AI gợi ý)
CREATE TABLE product_attribute_values (
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    attribute_id INT REFERENCES attributes(attribute_id) ON DELETE CASCADE,
    attr_value VARCHAR(255) NOT NULL, -- Ví dụ: '6.5 - 7.5'
    PRIMARY KEY (product_id, attribute_id)
);

-- ==========================================================
-- 3. NHÓM ĐẶT HÀNG & GIỎ HÀNG (ORDERS & CART)
-- ==========================================================

-- Bảng trung gian: Giỏ hàng (Cart)
CREATE TABLE cart_items (
    cart_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    order_code VARCHAR(50) UNIQUE NOT NULL, -- Mã đơn hàng cho VNPay
    
    total_amount DECIMAL(15, 2) NOT NULL,
    order_status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, shipping, completed, cancelled
    
    -- Thông tin giao hàng tại thời điểm đặt (tránh thay đổi theo profile)
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(15) NOT NULL,
    shipping_address TEXT NOT NULL,
    order_note TEXT,
    
    payment_method VARCHAR(20) DEFAULT 'VNPAY',
    payment_status INT DEFAULT 0, -- 0: Chờ, 1: Thành công, 2: Lỗi
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng trung gian: Chi tiết đơn hàng (Order Items)
CREATE TABLE order_items (
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id),
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(15, 2) NOT NULL, -- Lưu giá lúc mua
    PRIMARY KEY (order_id, product_id)
);

-- ==========================================================
-- 4. NHÓM THANH TOÁN VNPAY (PAYMENTS)
-- ==========================================================
CREATE TABLE vnpay_transactions (
    vnpay_id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
    vnp_txn_ref VARCHAR(50),      -- Mã tham chiếu gửi đi
    vnp_transaction_no VARCHAR(50), -- Mã giao dịch VNPay trả về
    vnp_response_code VARCHAR(10),  -- 00 là thành công
    vnp_amount DECIMAL(15, 2),
    vnp_bank_code VARCHAR(20),
    vnp_pay_date TIMESTAMP,
    vnp_raw_response JSONB,         -- Lưu log toàn bộ phản hồi từ VNPay
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 5. NHÓM NỘI DUNG & BLOG (CMS)
-- ==========================================================
CREATE TABLE blog_posts (
    post_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT NOT NULL,
    thumbnail_url TEXT,
    author_id INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);