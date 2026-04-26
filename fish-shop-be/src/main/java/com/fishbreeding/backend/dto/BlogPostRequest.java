package com.fishbreeding.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostRequest {

    @NotBlank(message = "Blog title is required")
    @Size(max = 255, message = "Blog title must not exceed 255 characters")
    private String title;

    @Size(max = 255, message = "Slug must not exceed 255 characters")
    private String slug;

    @NotBlank(message = "Blog content is required")
    @Size(max = 50000, message = "Blog content must not exceed 50000 characters")
    private String content;

    @Size(max = 2000, message = "Thumbnail URL must not exceed 2000 characters")
    private String thumbnailUrl;
    
    private com.fishbreeding.backend.entity.PostStatus status;
}
