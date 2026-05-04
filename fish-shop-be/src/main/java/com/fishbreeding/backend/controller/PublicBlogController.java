package com.fishbreeding.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.BlogPostResponse;
import com.fishbreeding.backend.service.BlogPostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/blog")
@RequiredArgsConstructor
public class PublicBlogController {

    private final BlogPostService blogPostService;

    @GetMapping
    public ResponseEntity<List<BlogPostResponse>> getPublicBlogPosts() {
        return ResponseEntity.ok(blogPostService.getPublicBlogPosts());
    }
}
