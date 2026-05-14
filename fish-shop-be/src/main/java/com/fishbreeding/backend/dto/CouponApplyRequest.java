package com.fishbreeding.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponApplyRequest {
    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Order total is required")
    private BigDecimal orderTotal;
}
