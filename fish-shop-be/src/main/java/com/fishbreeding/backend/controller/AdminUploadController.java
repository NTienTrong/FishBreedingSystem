package com.fishbreeding.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fishbreeding.backend.dto.CloudinaryUploadResponse;
import com.fishbreeding.backend.service.CloudinaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/uploads")
@RequiredArgsConstructor
@Validated
public class AdminUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/images")
    public ResponseEntity<CloudinaryUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder) {

        return ResponseEntity.ok(cloudinaryService.uploadImage(file, folder));
    }
}
