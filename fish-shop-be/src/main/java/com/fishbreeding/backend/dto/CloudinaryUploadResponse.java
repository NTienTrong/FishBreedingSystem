package com.fishbreeding.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudinaryUploadResponse {
    private String url;
    private String secureUrl;
    private String publicId;
    private String format;
    private Long bytes;
    private Integer width;
    private Integer height;
}
