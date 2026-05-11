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
public class AdminOrderItemResponse {
    private Long productId;
    private String name;
    private String sku;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal lineTotal;
}
