package com.fishbreeding.backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSummaryResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalOnline;
    private BigDecimal totalCash;
}
