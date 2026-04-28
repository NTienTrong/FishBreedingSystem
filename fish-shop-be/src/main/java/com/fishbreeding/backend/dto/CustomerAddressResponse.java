package com.fishbreeding.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddressResponse {
    private Long id;
    private String label;
    private String phone;
    private String address;
    private Boolean isDefault;
}
