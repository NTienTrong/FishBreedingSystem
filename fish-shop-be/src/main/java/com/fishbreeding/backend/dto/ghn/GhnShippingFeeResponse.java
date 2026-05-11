package com.fishbreeding.backend.dto.ghn;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GhnShippingFeeResponse {
    @JsonProperty("total")
    private long total;

    @JsonProperty("service_fee")
    private long serviceFee;

    @JsonProperty("surcharge")
    private long surcharge;

    @JsonProperty("r2s_fee")
    private long r2sFee;

    @JsonProperty("return_again")
    private long returnAgain;

    @JsonProperty("document_return")
    private long documentReturn;

    @JsonProperty("cod_fee")
    private long codFee;

    @JsonProperty("cod_failed_extra_charge")
    private long codFailedExtraCharge;

    @JsonProperty("pickup_fee")
    private long pickupFee;
}
