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
public class CustomerOrderResponse {
    private Long id;
    private String orderCode;
    private String ghnOrderCode;
    private OrderStatus orderStatus;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private List<CustomerOrderItemResponse> items;
}
