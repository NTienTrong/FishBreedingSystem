package com.fishbreeding.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fishbreeding.backend.dto.CategoryRequest;
import com.fishbreeding.backend.dto.CategoryResponse;
import com.fishbreeding.backend.entity.Category;
import com.fishbreeding.backend.exception.NotFoundException;
import com.fishbreeding.backend.repository.CategoryRepository;
import com.fishbreeding.backend.util.SlugUtil;
import com.fishbreeding.backend.validator.CategoryValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryValidator categoryValidator;

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "categories")
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "categoryById", key = "#id")
    public CategoryResponse getCategoryById(Long id) {
        categoryValidator.validateId(id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + id));

        return CategoryResponse.fromEntity(category);
    }

    @CacheEvict(cacheNames = {"categories", "categoryById"}, allEntries = true)
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = request.getName().trim();

        String slug = SlugUtil.toSlug(name);

        if (categoryRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Category.CategoryBuilder categoryBuilder = Category.builder()
                .name(name)
                .slug(slug)
                .description(request.getDescription())
            .imageUrl(request.getImageUrl())
            .isActive(Boolean.TRUE.equals(request.getIsActive()))
            .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        Category saved = categoryRepository.save(categoryBuilder.build());
        return CategoryResponse.fromEntity(saved);
    }

    @CacheEvict(cacheNames = {"categories", "categoryById"}, allEntries = true)
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        categoryValidator.validateId(id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + id));

        String name = request.getName().trim();

        category.setName(name);
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setActive(Boolean.TRUE.equals(request.getIsActive()));
        category.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        String newSlug = SlugUtil.toSlug(name);
        if (!newSlug.equals(category.getSlug())) {
            if (categoryRepository.existsBySlug(newSlug)) {
                newSlug = newSlug + "-" + System.currentTimeMillis();
            }
            category.setSlug(newSlug);
        }

        Category updated = categoryRepository.save(category);
        return CategoryResponse.fromEntity(updated);
    }

    @Transactional
    @CacheEvict(cacheNames = {"categories", "categoryById"}, allEntries = true)
    public void deleteCategory(Long id) {
        categoryValidator.validateId(id);

        if (!categoryRepository.existsById(id)) {
            throw new NotFoundException("Category not found with id: " + id);
        }

        categoryRepository.deleteProductCategoryMappings(id);
        categoryRepository.deleteById(id);
    }
}