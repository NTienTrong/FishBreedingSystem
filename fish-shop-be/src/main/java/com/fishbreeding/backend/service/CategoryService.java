package com.fishbreeding.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        categoryValidator.validateId(id);

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + id));

        return CategoryResponse.fromEntity(category);
    }

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
                .imageUrl(request.getImageUrl());

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new NotFoundException("Parent category not found"));
            categoryBuilder.parent(parent);
        }

        Category saved = categoryRepository.save(categoryBuilder.build());
        return CategoryResponse.fromEntity(saved);
    }

    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        categoryValidator.validateId(id);
        categoryValidator.validateParent(id, request.getParentId());

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + id));

        String name = request.getName().trim();

        category.setName(name);
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());

        String newSlug = SlugUtil.toSlug(name);
        if (!newSlug.equals(category.getSlug())) {
            if (categoryRepository.existsBySlug(newSlug)) {
                newSlug = newSlug + "-" + System.currentTimeMillis();
            }
            category.setSlug(newSlug);
        }

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new NotFoundException("Parent category not found"));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category updated = categoryRepository.save(category);
        return CategoryResponse.fromEntity(updated);
    }

    public void deleteCategory(Long id) {
        categoryValidator.validateId(id);

        if (!categoryRepository.existsById(id)) {
            throw new NotFoundException("Category not found with id: " + id);
        }

        categoryRepository.deleteById(id);
    }
}