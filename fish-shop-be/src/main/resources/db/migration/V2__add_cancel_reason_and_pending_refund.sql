-- Add cancel_reason column and support pending refund status.
-- Assumes PostgreSQL.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

ALTER TABLE orders
  ALTER COLUMN order_status TYPE varchar(30);

ALTER TABLE orders
  ALTER COLUMN payment_status TYPE varchar(20);
