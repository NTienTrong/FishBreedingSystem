package com.fishbreeding.backend.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class GhnProvinceResponse {
    @JsonProperty("ProvinceID")
    private int provinceId;

    @JsonProperty("ProvinceName")
    private String provinceName;
}
