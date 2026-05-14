package com.fishbreeding.backend.dto;

import java.math.BigDecimal;

import com.fishbreeding.backend.entity.CouponDiscountType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponApplyResponse {
    private String code;
    private CouponDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal discountAmount;
}
