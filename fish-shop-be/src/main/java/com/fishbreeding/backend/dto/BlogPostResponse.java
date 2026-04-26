package com.fishbreeding.backend.dto;

import java.time.LocalDateTime;

import com.fishbreeding.backend.entity.BlogPost;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogPostResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String thumbnailUrl;
    private Long authorId;
    private String authorUsername;
    private String authorFullName;
    private LocalDateTime createdAt;
    private Boolean isPublished;
    private com.fishbreeding.backend.entity.PostStatus status;
    private LocalDateTime publishedAt;

    public static BlogPostResponse fromEntity(BlogPost blogPost) {
        if (blogPost == null) {
            return null;
        }

        return BlogPostResponse.builder()
                .id(blogPost.getId())
                .title(blogPost.getTitle())
                .slug(blogPost.getSlug())
                .content(blogPost.getContent())
                .thumbnailUrl(blogPost.getThumbnailUrl())
                .authorId(blogPost.getAuthor() != null ? blogPost.getAuthor().getId() : null)
                .authorUsername(blogPost.getAuthor() != null ? blogPost.getAuthor().getUsername() : null)
                .authorFullName(blogPost.getAuthor() != null ? blogPost.getAuthor().getFullName() : null)
                .createdAt(blogPost.getCreatedAt())
                .isPublished(blogPost.getIsPublished())
                .status(blogPost.getStatus())
                .publishedAt(blogPost.getPublishedAt())
                .build();
    }
}
