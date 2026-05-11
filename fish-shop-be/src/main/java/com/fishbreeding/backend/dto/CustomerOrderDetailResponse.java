package com.fishbreeding.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fishbreeding.backend.entity.OrderStatus;
import com.fishbreeding.backend.entity.PaymentMethod;
import com.fishbreeding.backend.entity.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerOrderDetailResponse {
    private Long id;
    private String orderCode;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private BigDecimal totalAmount;
    private BigDecimal shippingFee;
    private LocalDateTime createdAt;
    private String recipientName;
    private String recipientPhone;
    private String shippingAddress;
    private String orderNote;
    private String cancelReason;
    private List<CustomerOrderItemResponse> items;
}
