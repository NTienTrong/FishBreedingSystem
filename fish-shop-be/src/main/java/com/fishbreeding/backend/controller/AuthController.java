package com.fishbreeding.backend.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fishbreeding.backend.dto.ChangePasswordRequest;
import com.fishbreeding.backend.dto.LoginRequest;
import com.fishbreeding.backend.dto.LoginResponse;
import com.fishbreeding.backend.dto.RegisterRequest;
import com.fishbreeding.backend.dto.SocialLoginRequest;
import com.fishbreeding.backend.dto.UpdateProfileRequest;
import com.fishbreeding.backend.dto.UserResponse;
import com.fishbreeding.backend.service.AuthService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/social-login")
    public ResponseEntity<LoginResponse> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        return ResponseEntity.ok(authService.socialLogin(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Principal principal) {
        if (principal == null || !StringUtils.hasText(principal.getName())) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(UserResponse.fromEntity(authService.getCurrentUser(principal.getName())));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(Principal principal,
                                                      @Valid @RequestBody UpdateProfileRequest request) {
        if (principal == null || !StringUtils.hasText(principal.getName())) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(UserResponse.fromEntity(authService.updateProfile(principal.getName(), request)));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String token = resolveToken(request);
        String clientIp = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        authService.logout(token, clientIp, userAgent);
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        if (principal == null || !StringUtils.hasText(principal.getName())) {
            return ResponseEntity.status(401).build();
        }

        authService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated"));
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        for (Cookie cookie : cookies) {
            if ("adminToken".equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
