package com.fishbreeding.backend.validator;

import org.springframework.stereotype.Component;

import com.fishbreeding.backend.exception.BadRequestException;

@Component
public class UserValidator {

    public void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Invalid user ID");
        }
    }

    public void validatePasswordForCreate(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new BadRequestException("Password is required for new user");
        }
    }

    public void validateRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            return;
        }

        String normalized = role.trim().toUpperCase();
        if (!"ADMIN".equals(normalized) && !"CUSTOMER".equals(normalized)) {
            throw new BadRequestException("Role must be ADMIN or CUSTOMER");
        }
    }
}
