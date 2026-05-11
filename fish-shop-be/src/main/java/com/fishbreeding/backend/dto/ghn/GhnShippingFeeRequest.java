package com.fishbreeding.backend.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GhnShippingFeeRequest {
    @JsonProperty("to_district_id")
    private int toDistrictId;

    @JsonProperty("weight")
    private int weight;

    @JsonProperty("length")
    @Builder.Default
    private int length = 15;

    @JsonProperty("width")
    @Builder.Default
    private int width = 15;

    @JsonProperty("height")
    @Builder.Default
    private int height = 15;

    @JsonProperty("service_type_id")
    @Builder.Default
    private int serviceTypeId = 2; // Standard shipping

    @JsonProperty("coupon")
    private String coupon;
}
