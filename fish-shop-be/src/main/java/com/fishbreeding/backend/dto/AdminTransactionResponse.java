package com.fishbreeding.backend.dto;

import java.math.BigDecimal;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fishbreeding.backend.entity.OrderStatus;
import com.fishbreeding.backend.entity.PaymentMethod;
import com.fishbreeding.backend.entity.TransactionStatus;
import com.fishbreeding.backend.entity.TransactionType;

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
    private PaymentMethod paymentMethod;
    private TransactionType transactionType;
    private String referenceCode;
    private TransactionStatus status;
    private BigDecimal amount;
    private LocalDateTime createdAt;
}
