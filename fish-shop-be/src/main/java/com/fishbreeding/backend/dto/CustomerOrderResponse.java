package com.fishbreeding.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
    private String orderStatus;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private List<CustomerOrderItemResponse> items;
}
