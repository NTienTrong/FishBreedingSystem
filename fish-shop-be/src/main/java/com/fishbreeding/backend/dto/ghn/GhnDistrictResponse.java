package com.fishbreeding.backend.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GhnDistrictResponse {
    @JsonProperty("DistrictID")
    private int districtId;

    @JsonProperty("DistrictName")
    private String districtName;

    @JsonProperty("ProvinceID")
    private int provinceId;
}
