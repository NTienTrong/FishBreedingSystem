package com.fishbreeding.backend.service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fishbreeding.backend.dto.UserRequest;
import com.fishbreeding.backend.dto.UserResponse;
import com.fishbreeding.backend.entity.User;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.exception.NotFoundException;
import com.fishbreeding.backend.repository.UserRepository;
import com.fishbreeding.backend.validator.UserValidator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserValidator userValidator;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        userValidator.validateId(id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse createUser(UserRequest request) {
        userValidator.validatePasswordForCreate(request.getPassword());
        userValidator.validateRole(request.getRole());

        String username = normalizeRequired(request.getUsername(), "Username is required");
        String email = normalizeRequired(request.getEmail(), "Email is required").toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(request.getPassword().trim()))
                .fullName(normalizeRequired(request.getFullName(), "Full name is required"))
                .email(email)
                .phone(trimToNull(request.getPhone()))
                .address(trimToNull(request.getAddress()))
                .role(normalizeRole(request.getRole()))
                .provider("LOCAL")
                .isActive(request.getIsActive() == null ? Boolean.TRUE : request.getIsActive())
                .build();

        User saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public UserResponse updateUser(Long id, UserRequest request) {
        userValidator.validateId(id);
        userValidator.validateRole(request.getRole());

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        String username = normalizeRequired(request.getUsername(), "Username is required");
        String email = normalizeRequired(request.getEmail(), "Email is required").toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsernameAndIdNot(username, id)) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmailAndIdNot(email, id)) {
            throw new BadRequestException("Email already exists");
        }

        user.setUsername(username);
        user.setFullName(normalizeRequired(request.getFullName(), "Full name is required"));
        user.setEmail(email);
        user.setPhone(trimToNull(request.getPhone()));
        user.setAddress(trimToNull(request.getAddress()));
        user.setRole(resolveRoleForUpdate(request.getRole(), user.getRole()));
        user.setIsActive(request.getIsActive() == null ? user.getIsActive() : request.getIsActive());

        String password = trimToNull(request.getPassword());
        if (password != null) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }

        User updated = userRepository.save(user);
        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, Boolean isActive) {
        userValidator.validateId(id);
        if (isActive == null) {
            throw new BadRequestException("Status is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));

        user.setIsActive(isActive);
        User updated = userRepository.save(user);
        return UserResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteUser(Long id) {
        userValidator.validateId(id);

        if (!userRepository.existsById(id)) {
            throw new NotFoundException("User not found with id: " + id);
        }

        userRepository.deleteById(id);
    }

    private String normalizeRequired(String value, String errorMessage) {
        String normalized = trimToNull(value);
        if (normalized == null) {
            throw new BadRequestException(errorMessage);
        }
        return normalized;
    }

    private String normalizeRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            return "CUSTOMER";
        }

        return role.trim().toUpperCase(Locale.ROOT);
    }

    private String resolveRoleForUpdate(String requestedRole, String currentRole) {
        if (requestedRole == null || requestedRole.trim().isEmpty()) {
            return currentRole == null || currentRole.isBlank() ? "CUSTOMER" : currentRole.trim().toUpperCase(Locale.ROOT);
        }

        return requestedRole.trim().toUpperCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
