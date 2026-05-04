package com.fishbreeding.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerCheckoutResponse {
    private Long orderId;
    private String orderCode;
    private BigDecimal totalAmount;
    private String orderStatus;
    private Integer paymentStatus;
    private String paymentMethod;
    private String paymentUrl;
    private Boolean vnpayConfigured;
    private String message;
}