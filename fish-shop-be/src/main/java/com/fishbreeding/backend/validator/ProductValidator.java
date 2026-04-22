package com.fishbreeding.backend.validator;

import org.springframework.stereotype.Component;

import com.fishbreeding.backend.exception.BadRequestException;

@Component
public class ProductValidator {

    public void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid product ID");
        }
    }
}
