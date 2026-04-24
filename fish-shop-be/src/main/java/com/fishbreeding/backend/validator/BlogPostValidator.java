package com.fishbreeding.backend.validator;

import java.net.URI;

import org.springframework.stereotype.Component;

import com.fishbreeding.backend.exception.BadRequestException;

@Component
public class BlogPostValidator {

    public void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid blog post ID");
        }
    }

    public void validateThumbnailUrl(String thumbnailUrl) {
        if (thumbnailUrl == null || thumbnailUrl.isBlank()) {
            return;
        }

        try {
            URI uri = URI.create(thumbnailUrl);
            String scheme = uri.getScheme();

            if (scheme == null || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
                throw new BadRequestException("Thumbnail URL must be a valid http/https URL");
            }

            if (uri.getHost() == null || uri.getHost().isBlank()) {
                throw new BadRequestException("Thumbnail URL must include host");
            }
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Thumbnail URL is invalid");
        }
    }
}
