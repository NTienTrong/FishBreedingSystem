package com.fishbreeding.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryRestockRequest {
    @NotNull
    private Long productId;

    @NotNull
    @Min(1)
    private Integer quantity;

    private BigDecimal costPrice;

    private String reason;
}
