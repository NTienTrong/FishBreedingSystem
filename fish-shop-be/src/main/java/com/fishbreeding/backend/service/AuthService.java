package com.fishbreeding.backend.service;

import java.util.Locale;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fishbreeding.backend.dto.ChangePasswordRequest;
import com.fishbreeding.backend.dto.LoginRequest;
import com.fishbreeding.backend.dto.LoginResponse;
import com.fishbreeding.backend.dto.RegisterRequest;
import com.fishbreeding.backend.dto.SocialLoginRequest;
import com.fishbreeding.backend.dto.UpdateProfileRequest;
import com.fishbreeding.backend.entity.User;
import com.fishbreeding.backend.exception.BadRequestException;
import com.fishbreeding.backend.repository.UserRepository;
import com.fishbreeding.backend.security.JwtProvider;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final SessionStoreService sessionStoreService;

    public LoginResponse login(LoginRequest request) {
        String identifier = normalizeRequired(resolveIdentifier(request), "Username or email is required");
        Optional<User> userOptional = findByIdentifier(identifier);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            ensureActive(user);
            String storedPassword = user.getPasswordHash();
            if (storedPassword == null || storedPassword.isBlank()) {
                throw new BadRequestException("Account uses social login");
            }
            if (passwordEncoder.matches(request.getPassword(), storedPassword)) {
                String token = jwtProvider.generateToken(user.getUsername(), user.getRole());
                sessionStoreService.registerSession(token, user.getRole(), user.getUsername());
                return LoginResponse.builder()
                        .token(token)
                        .id(user.getId())
                        .username(user.getUsername())
                        .role(normalizeRole(user.getRole()))
                        .build();
            }

            if (isLegacyPlainPassword(storedPassword, request.getPassword())) {
                user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                userRepository.save(user);
                String token = jwtProvider.generateToken(user.getUsername(), user.getRole());
                sessionStoreService.registerSession(token, user.getRole(), user.getUsername());
                return LoginResponse.builder()
                        .token(token)
                        .id(user.getId())
                        .username(user.getUsername())
                        .role(normalizeRole(user.getRole()))
                        .build();
            }
        }
        throw new RuntimeException("Invalid username or password");
    }

    public LoginResponse register(RegisterRequest request) {
        String email = normalizeRequired(request.getEmail(), "Email is required").toLowerCase(Locale.ROOT);
        String fullName = normalizeRequired(request.getFullName(), "Full name is required");
        String password = normalizeRequired(request.getPassword(), "Password is required");

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already exists");
        }

        String baseUsername = trimToNull(request.getUsername());
        if (baseUsername == null) {
            baseUsername = email.substring(0, email.indexOf('@'));
        }

        String username = generateUniqueUsername(baseUsername);

        User user = User.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode(password))
                .fullName(fullName)
                .email(email)
                .phone(trimToNull(request.getPhone()))
                .address(trimToNull(request.getAddress()))
                .role("CUSTOMER")
                .provider("LOCAL")
                .isActive(Boolean.TRUE)
                .build();

        User saved = userRepository.save(user);
        String token = jwtProvider.generateToken(saved.getUsername(), saved.getRole());
        sessionStoreService.registerSession(token, saved.getRole(), saved.getUsername());

        return LoginResponse.builder()
                .token(token)
                .id(saved.getId())
                .username(saved.getUsername())
                .role(normalizeRole(saved.getRole()))
                .build();
    }

    public LoginResponse socialLogin(SocialLoginRequest request) {
        String provider = normalizeRequired(request.getProvider(), "Provider is required").toUpperCase(Locale.ROOT);
        if (!"GOOGLE".equals(provider)) {
            throw new BadRequestException("Only GOOGLE provider is supported");
        }

        String providerId = normalizeRequired(request.getProviderId(), "Provider ID is required");

        Optional<User> existingByProvider = userRepository.findByProviderAndProviderId(provider, providerId);
        if (existingByProvider.isPresent()) {
            User user = existingByProvider.get();
            ensureActive(user);
                String token = jwtProvider.generateToken(user.getUsername(), user.getRole());
                sessionStoreService.registerSession(token, user.getRole(), user.getUsername());
            return LoginResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .username(user.getUsername())
                    .role(normalizeRole(user.getRole()))
                    .build();
        }

        String email = trimToNull(request.getEmail());
        if (email != null) {
            email = email.toLowerCase(Locale.ROOT);
        }

        Optional<User> existingByEmail = Optional.empty();
        if (email != null) {
            existingByEmail = userRepository.findByEmail(email);
        }

        if (existingByEmail.isPresent()) {
            User user = existingByEmail.get();
            ensureActive(user);
            if (user.getProviderId() == null || user.getProviderId().isBlank()) {
                user.setProvider(provider);
                user.setProviderId(providerId);
                userRepository.save(user);
            }
                String token = jwtProvider.generateToken(user.getUsername(), user.getRole());
                sessionStoreService.registerSession(token, user.getRole(), user.getUsername());
            return LoginResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .username(user.getUsername())
                    .role(normalizeRole(user.getRole()))
                    .build();
        }

        String usernameSeed = email != null ? email.substring(0, email.indexOf('@')) : "google_user";
        String username = generateUniqueUsername(usernameSeed);
        String fullName = trimToNull(request.getFullName());

        User user = User.builder()
                .username(username)
                .passwordHash(null)
                .fullName(fullName)
                .email(email)
                .phone(null)
                .address(null)
                .role("CUSTOMER")
                .provider(provider)
                .providerId(providerId)
                .isActive(Boolean.TRUE)
                .build();

        User saved = userRepository.save(user);
        String token = jwtProvider.generateToken(saved.getUsername(), saved.getRole());
        sessionStoreService.registerSession(token, saved.getRole(), saved.getUsername());

        return LoginResponse.builder()
                .token(token)
                .id(saved.getId())
                .username(saved.getUsername())
                .role(normalizeRole(saved.getRole()))
                .build();
    }

    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    public User updateProfile(String username, UpdateProfileRequest request) {
        User user = getCurrentUser(username);
        String fullName = trimToNull(request.getFullName());
        String phone = trimToNull(request.getPhone());
        String address = trimToNull(request.getAddress());

        if (fullName != null) {
            user.setFullName(fullName);
        }
        if (phone != null) {
            user.setPhone(phone);
        }
        if (address != null) {
            user.setAddress(address);
        }

        return userRepository.save(user);
    }

    public void logout(String token, String clientIp, String userAgent) {
        if (token == null || token.isBlank()) {
            log.info("Logout audit: anonymous request from ip={}, userAgent={}", clientIp, userAgent);
            return;
        }

        try {
            Claims claims = jwtProvider.extractAllClaims(token);
            String username = claims.getSubject();
            Object roleClaim = claims.get("role");
            String role = roleClaim == null ? "UNKNOWN" : roleClaim.toString();

            sessionStoreService.revokeSession(token, role);

            log.info("Logout audit: username={}, role={}, ip={}, userAgent={}", username, role, clientIp, userAgent);
        } catch (JwtException | IllegalArgumentException ex) {
            log.info("Logout audit: invalid_or_expired_token ip={}, userAgent={}", clientIp, userAgent);
        }
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = getCurrentUser(username);
        ensureActive(user);

        String storedPassword = user.getPasswordHash();
        if (storedPassword == null || storedPassword.isBlank()) {
            throw new BadRequestException("Account uses social login");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), storedPassword)) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private boolean isLegacyPlainPassword(String storedPassword, String rawPassword) {
        return storedPassword != null && !storedPassword.startsWith("$2") && storedPassword.equals(rawPassword);
    }

    private String normalizeRole(String role) {
        return role == null ? "CUSTOMER" : role.trim().toUpperCase();
    }

    private Optional<User> findByIdentifier(String identifier) {
        Optional<User> byUsername = userRepository.findByUsername(identifier);
        if (byUsername.isPresent()) {
            return byUsername;
        }

        return userRepository.findByEmail(identifier.toLowerCase(Locale.ROOT));
    }

    private void ensureActive(User user) {
        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new BadRequestException("Tài khoản đã bị khóa.");
        }
    }

    private String resolveIdentifier(LoginRequest request) {
        String identifier = trimToNull(request.getIdentifier());
        if (identifier != null) {
            return identifier;
        }

        return trimToNull(request.getUsername());
    }

    private String normalizeRequired(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new BadRequestException(message);
        }
        return value.trim();
    }

    private String generateUniqueUsername(String baseUsername) {
        String normalized = baseUsername.trim().toLowerCase(Locale.ROOT);
        if (!userRepository.existsByUsername(normalized)) {
            return normalized;
        }

        int suffix = 1;
        String candidate = normalized + suffix;
        while (userRepository.existsByUsername(candidate)) {
            suffix += 1;
            candidate = normalized + suffix;
        }

        return candidate;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
