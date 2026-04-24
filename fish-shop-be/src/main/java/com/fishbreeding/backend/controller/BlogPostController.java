package com.fishbreeding.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.BlogPostRequest;
import com.fishbreeding.backend.dto.BlogPostResponse;
import com.fishbreeding.backend.service.BlogPostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/blog")
@RequiredArgsConstructor
@Validated
public class BlogPostController {

    private final BlogPostService blogPostService;

    @GetMapping
    public ResponseEntity<List<BlogPostResponse>> getAllBlogPosts() {
        return ResponseEntity.ok(blogPostService.getAllBlogPosts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPostResponse> getBlogPostById(@PathVariable Long id) {
        return ResponseEntity.ok(blogPostService.getBlogPostById(id));
    }

    @PostMapping
    public ResponseEntity<BlogPostResponse> createBlogPost(@Valid @RequestBody BlogPostRequest request) {
        BlogPostResponse response = blogPostService.createBlogPost(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogPostResponse> updateBlogPost(
            @PathVariable Long id,
            @Valid @RequestBody BlogPostRequest request) {

        return ResponseEntity.ok(blogPostService.updateBlogPost(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlogPost(@PathVariable Long id) {
        blogPostService.deleteBlogPost(id);
        return ResponseEntity.noContent().build();
    }
}
