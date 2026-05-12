package com.fishbreeding.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddressRequest {
    @NotBlank(message = "Receiver name is required")
    @Size(max = 100, message = "Receiver name must not exceed 100 characters")
    private String receiverName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be exactly 10 digits")
    private String phoneNumber;

    @NotNull(message = "Province ID is required")
    @Min(value = 1, message = "Province ID must be greater than 0")
    private Integer provinceId;

    @NotNull(message = "District ID is required")
    @Min(value = 1, message = "District ID must be greater than 0")
    private Integer districtId;

    @NotBlank(message = "Ward code is required")
    @Size(max = 20, message = "Ward code must not exceed 20 characters")
    private String wardCode;

    @NotBlank(message = "Province name is required")
    @Size(max = 100, message = "Province name must not exceed 100 characters")
    private String provinceName;

    @NotBlank(message = "District name is required")
    @Size(max = 100, message = "District name must not exceed 100 characters")
    private String districtName;

    @NotBlank(message = "Ward name is required")
    @Size(max = 100, message = "Ward name must not exceed 100 characters")
    private String wardName;

    @NotBlank(message = "Street address is required")
    @Size(max = 1000, message = "Street address must not exceed 1000 characters")
    private String streetAddress;

    private Boolean isDefault;
}
