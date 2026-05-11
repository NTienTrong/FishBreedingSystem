package com.fishbreeding.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerCheckoutRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    private String province;
    private String district;
    private String ward;
    private Integer provinceId;
    private Integer districtId;
    private String wardCode;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // "VNPAY" or "COD"

    private String note;
}