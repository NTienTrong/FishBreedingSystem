package com.fishbreeding.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.JsonNode;
import com.fishbreeding.backend.entity.OrderStatus;
import com.fishbreeding.backend.entity.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminTransactionResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private String vnpTxnRef;
    private String vnpTransactionNo;
    private String vnpResponseCode;
    private BigDecimal vnpAmount;
    private String vnpBankCode;
    private LocalDateTime vnpPayDate;
    private LocalDateTime createdAt;
    private JsonNode rawResponse;
}
