package com.fishbreeding.backend.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GhnWardResponse {
    @JsonProperty("WardCode")
    private String wardCode;

    @JsonProperty("WardName")
    private String wardName;

    @JsonProperty("DistrictID")
    private int districtId;
}
