CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    reference_code VARCHAR(100),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_transactions_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
