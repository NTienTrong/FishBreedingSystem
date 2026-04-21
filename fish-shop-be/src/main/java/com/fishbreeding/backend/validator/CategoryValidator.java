package com.fishbreeding.backend.validator;

import org.springframework.stereotype.Component;

import com.fishbreeding.backend.exception.BadRequestException;

@Component
public class CategoryValidator {

    public void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid category ID");
        }
    }

    public void validateParent(Long id, Long parentId) {
        if (parentId != null && parentId.equals(id)) {
            throw new BadRequestException("Category cannot be its own parent");
        }
    }
}