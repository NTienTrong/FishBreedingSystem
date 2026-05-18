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
}