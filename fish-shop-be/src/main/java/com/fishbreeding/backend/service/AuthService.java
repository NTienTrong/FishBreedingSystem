package com.fishbreeding.backend.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fishbreeding.backend.dto.LoginRequest;
import com.fishbreeding.backend.dto.LoginResponse;
import com.fishbreeding.backend.entity.User;
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

    public LoginResponse login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String storedPassword = user.getPasswordHash();
            if (passwordEncoder.matches(request.getPassword(), storedPassword)) {
                String token = jwtProvider.generateToken(user.getUsername(), user.getRole());
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

            log.info("Logout audit: username={}, role={}, ip={}, userAgent={}", username, role, clientIp, userAgent);
        } catch (JwtException | IllegalArgumentException ex) {
            log.info("Logout audit: invalid_or_expired_token ip={}, userAgent={}", clientIp, userAgent);
        }
    }

    private boolean isLegacyPlainPassword(String storedPassword, String rawPassword) {
        return storedPassword != null && !storedPassword.startsWith("$2") && storedPassword.equals(rawPassword);
    }

    private String normalizeRole(String role) {
        return role == null ? "CUSTOMER" : role.trim().toUpperCase();
    }
}
