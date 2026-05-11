package com.fishbreeding.backend.entity;

public enum OrderStatus {
    PENDING_PAYMENT,
    PENDING,
    PENDING_REFUND,
    PROCESSING,
    DELIVERING,
    COMPLETED,
    CANCELLED
}
