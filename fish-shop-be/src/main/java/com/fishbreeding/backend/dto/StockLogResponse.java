package com.fishbreeding.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fishbreeding.backend.entity.StockChangeType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockLogResponse {
    private Long id;
    private Long productId;
    private String productName;
    private StockChangeType changeType;
    private Integer quantityChanged;
    private String reason;
    private String partnerName;
    private String partnerPhone;
    private String partnerAddress;
    private BigDecimal costPrice;
    private LocalDateTime createdAt;
}
