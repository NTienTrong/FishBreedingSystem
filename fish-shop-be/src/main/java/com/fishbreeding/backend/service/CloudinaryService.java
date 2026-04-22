package com.fishbreeding.backend.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fishbreeding.backend.dto.CloudinaryUploadResponse;
import com.fishbreeding.backend.exception.BadRequestException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryUploadResponse uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File upload is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        String uploadFolder = (folder == null || folder.isBlank()) ? "fish-shop/products" : folder.trim();

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", uploadFolder,
                            "resource_type", "image"));

            return CloudinaryUploadResponse.builder()
                    .url((String) result.get("url"))
                    .secureUrl((String) result.get("secure_url"))
                    .publicId((String) result.get("public_id"))
                    .format((String) result.get("format"))
                    .bytes(castToLong(result.get("bytes")))
                    .width(castToInteger(result.get("width")))
                    .height(castToInteger(result.get("height")))
                    .build();
        } catch (IOException ex) {
            throw new BadRequestException("Failed to upload image to Cloudinary: " + ex.getMessage());
        }
    }

    private Long castToLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    private Integer castToInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        return null;
    }
}
