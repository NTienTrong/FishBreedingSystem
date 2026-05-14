CREATE TABLE IF NOT EXISTS coupons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(60) NOT NULL UNIQUE,
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(15, 2) NOT NULL,
    min_order_value NUMERIC(15, 2) NOT NULL,
    max_discount_amount NUMERIC(15, 2),
    usage_limit INTEGER NOT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(60);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(15, 2);
