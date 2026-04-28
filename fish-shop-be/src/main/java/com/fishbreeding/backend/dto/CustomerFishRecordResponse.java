package com.fishbreeding.backend.dto;

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
public class CustomerFishRecordResponse {
    private Long productId;
    private String name;
    private String imageUrl;
    private LocalDateTime purchasedAt;
    private List<CustomerAttributeValueResponse> attributes;
    private String certificateUrl;
}
