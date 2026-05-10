package com.fishbreeding.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fishbreeding.backend.dto.BlogPostRequest;
import com.fishbreeding.backend.dto.BlogPostResponse;
import com.fishbreeding.backend.entity.BlogPost;
import com.fishbreeding.backend.entity.PostStatus;
import com.fishbreeding.backend.entity.User;
import com.fishbreeding.backend.exception.BadRequestException;
import java.time.LocalDateTime;
import com.fishbreeding.backend.exception.NotFoundException;
import com.fishbreeding.backend.repository.BlogPostRepository;
import com.fishbreeding.backend.repository.UserRepository;
import com.fishbreeding.backend.util.SlugUtil;
import com.fishbreeding.backend.validator.BlogPostValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final UserRepository userRepository;
    private final BlogPostValidator blogPostValidator;

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "adminBlogPosts")
    public List<BlogPostResponse> getAllBlogPosts() {
        return blogPostRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .map(BlogPostResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "publicBlogPosts")
    public List<BlogPostResponse> getPublicBlogPosts() {
        return blogPostRepository.findAllByIsPublishedTrueOrderByPublishedAtDescCreatedAtDescIdDesc().stream()
                .map(BlogPostResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "publicBlogBySlug", key = "#slug")
    public BlogPostResponse getPublicBlogPostBySlug(String slug) {
        String normalizedSlug = trimToNull(slug);
        if (normalizedSlug == null) {
            throw new NotFoundException("Blog post slug is required");
        }

        BlogPost blogPost = blogPostRepository.findBySlugAndIsPublishedTrue(normalizedSlug)
                .orElseThrow(() -> new NotFoundException("Blog post not found with slug: " + normalizedSlug));

        return BlogPostResponse.fromEntity(blogPost);
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "publicBlogById", key = "#id")
    public BlogPostResponse getPublicBlogPostById(Long id) {
        blogPostValidator.validateId(id);

        BlogPost blogPost = blogPostRepository.findByIdAndIsPublishedTrue(id)
                .orElseThrow(() -> new NotFoundException("Blog post not found with id: " + id));

        return BlogPostResponse.fromEntity(blogPost);
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "blogById", key = "#id")
    public BlogPostResponse getBlogPostById(Long id) {
        blogPostValidator.validateId(id);

        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Blog post not found with id: " + id));

        return BlogPostResponse.fromEntity(blogPost);
    }

    @Transactional
    @CacheEvict(cacheNames = {"adminBlogPosts", "publicBlogPosts", "blogById", "publicBlogBySlug", "publicBlogById"}, allEntries = true)
    public BlogPostResponse createBlogPost(BlogPostRequest request) {
        String title = request.getTitle().trim();
        String content = request.getContent().trim();
        String thumbnailUrl = trimToNull(request.getThumbnailUrl());

        if (content.isBlank()) {
            throw new BadRequestException("Blog content is required");
        }

        blogPostValidator.validateThumbnailUrl(thumbnailUrl);

        PostStatus status = request.getStatus() != null ? request.getStatus() : PostStatus.DRAFT;
        boolean isPublished = (status == PostStatus.PUBLISHED);
        LocalDateTime publishedAt = isPublished ? LocalDateTime.now() : null;

        BlogPost blogPost = BlogPost.builder()
                .title(title)
                .slug(buildUniqueSlug(request.getSlug(), title, null))
                .content(content)
                .thumbnailUrl(thumbnailUrl)
                .author(resolveCurrentAdminUser())
                .status(status)
                .isPublished(isPublished)
                .publishedAt(publishedAt)
                .build();

        BlogPost saved = blogPostRepository.save(blogPost);
        return BlogPostResponse.fromEntity(saved);
    }

    @Transactional
    @CacheEvict(cacheNames = {"adminBlogPosts", "publicBlogPosts", "blogById", "publicBlogBySlug", "publicBlogById"}, allEntries = true)
    public BlogPostResponse updateBlogPost(Long id, BlogPostRequest request) {
        blogPostValidator.validateId(id);

        BlogPost blogPost = blogPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Blog post not found with id: " + id));

        String title = request.getTitle().trim();
        String content = request.getContent().trim();
        String thumbnailUrl = trimToNull(request.getThumbnailUrl());

        if (content.isBlank()) {
            throw new BadRequestException("Blog content is required");
        }

        blogPostValidator.validateThumbnailUrl(thumbnailUrl);

        PostStatus newStatus = request.getStatus() != null ? request.getStatus() : blogPost.getStatus();
        
        if (newStatus == PostStatus.PUBLISHED && blogPost.getStatus() != PostStatus.PUBLISHED) {
            blogPost.setIsPublished(true);
            if (blogPost.getPublishedAt() == null) {
                blogPost.setPublishedAt(LocalDateTime.now());
            }
        } else if (newStatus != PostStatus.PUBLISHED) {
            blogPost.setIsPublished(false);
        }
        
        blogPost.setStatus(newStatus);

        blogPost.setTitle(title);
        blogPost.setSlug(buildUniqueSlug(request.getSlug(), title, id));
        blogPost.setContent(content);
        blogPost.setThumbnailUrl(thumbnailUrl);

        if (blogPost.getAuthor() == null) {
            blogPost.setAuthor(resolveCurrentAdminUser());
        }

        BlogPost updated = blogPostRepository.save(blogPost);
        return BlogPostResponse.fromEntity(updated);
    }

    @Transactional
    @CacheEvict(cacheNames = {"adminBlogPosts", "publicBlogPosts", "blogById", "publicBlogBySlug", "publicBlogById"}, allEntries = true)
    public void deleteBlogPost(Long id) {
        blogPostValidator.validateId(id);

        if (!blogPostRepository.existsById(id)) {
            throw new NotFoundException("Blog post not found with id: " + id);
        }

        blogPostRepository.deleteById(id);
    }

    private User resolveCurrentAdminUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("Authenticated admin user is required");
        }

        String username = authentication.getName();
        if (username == null || username.isBlank()) {
            throw new BadRequestException("Authenticated admin username is missing");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Admin user not found with username: " + username));
    }

    private String buildUniqueSlug(String requestedSlug, String title, Long excludeBlogPostId) {
        String slugSource = trimToNull(requestedSlug);
        String baseSlug = SlugUtil.toSlug(slugSource != null ? slugSource : title);

        if (baseSlug.isBlank()) {
            throw new BadRequestException("Unable to generate slug from title or slug input");
        }

        String slug = baseSlug;
        if (excludeBlogPostId == null) {
            if (blogPostRepository.existsBySlug(slug)) {
                slug = baseSlug + "-" + System.currentTimeMillis();
            }
            return slug;
        }

        if (blogPostRepository.existsBySlugAndIdNot(slug, excludeBlogPostId)) {
            slug = baseSlug + "-" + System.currentTimeMillis();
        }

        return slug;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
