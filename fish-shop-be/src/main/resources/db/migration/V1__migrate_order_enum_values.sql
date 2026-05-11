-- Migrate legacy lowercase values to enum-style uppercase strings.
-- Assumes PostgreSQL.

ALTER TABLE orders
  ALTER COLUMN order_status TYPE varchar(30)
  USING CASE
    WHEN order_status IS NULL THEN 'PENDING'
    WHEN LOWER(order_status) = 'pending_payment' THEN 'PENDING_PAYMENT'
    WHEN LOWER(order_status) = 'pending_confirmation' THEN 'PENDING'
    WHEN LOWER(order_status) = 'pending' THEN 'PENDING'
    WHEN LOWER(order_status) = 'processing' THEN 'PROCESSING'
    WHEN LOWER(order_status) = 'delivering' THEN 'DELIVERING'
    WHEN LOWER(order_status) = 'completed' THEN 'COMPLETED'
    WHEN LOWER(order_status) = 'paid' THEN 'PENDING'
    WHEN LOWER(order_status) IN ('failed', 'stock_issue', 'cancelled', 'canceled') THEN 'CANCELLED'
    ELSE UPPER(order_status::text)
  END;

ALTER TABLE orders
  ALTER COLUMN payment_method TYPE varchar(20)
  USING CASE
    WHEN payment_method IS NULL THEN 'VNPAY'
    WHEN LOWER(payment_method) = 'cod' THEN 'COD'
    WHEN LOWER(payment_method) = 'vnpay' THEN 'VNPAY'
    ELSE UPPER(payment_method::text)
  END;

ALTER TABLE orders
  ALTER COLUMN payment_status TYPE varchar(20)
  USING CASE
    WHEN payment_status IS NULL THEN 'UNPAID'
    WHEN payment_status::text = '0' THEN 'UNPAID'
    WHEN payment_status::text = '1' THEN 'PAID'
    WHEN payment_status::text = '2' THEN 'FAILED'
    WHEN LOWER(payment_status::text) IN ('unpaid', 'paid', 'failed') THEN UPPER(payment_status::text)
    ELSE 'UNPAID'
  END;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stock_deducted boolean NOT NULL DEFAULT false;

UPDATE orders
  SET stock_deducted = true
  WHERE payment_method = 'COD'
    AND order_status <> 'CANCELLED';

UPDATE orders
  SET stock_deducted = true
  WHERE payment_method = 'VNPAY'
    AND payment_status = 'PAID';
