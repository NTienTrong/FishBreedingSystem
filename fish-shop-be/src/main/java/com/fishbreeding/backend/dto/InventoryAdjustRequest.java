package com.fishbreeding.backend.dto;

import com.fishbreeding.backend.entity.StockChangeType;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InventoryAdjustRequest {
    @NotNull
    private Long productId;

    @NotNull
    @Min(0)
    private Integer newQuantity;

    private StockChangeType changeType;

    private String reason;
}
