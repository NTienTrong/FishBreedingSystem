package com.fishbreeding.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageRequest {

    @NotBlank(message = "Image URL is required")
    @Size(max = 2000, message = "Image URL must not exceed 2000 characters")
    private String imageUrl;

    private Boolean isMain;

    @PositiveOrZero(message = "Sort order must be zero or positive")
    private Integer sortOrder;
}
