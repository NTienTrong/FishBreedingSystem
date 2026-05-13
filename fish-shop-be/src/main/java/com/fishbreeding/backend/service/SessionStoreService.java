package com.fishbreeding.backend.service;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SessionStoreService {

    private static final Duration ADMIN_TTL = Duration.ofHours(4);
    private static final Duration CUSTOMER_TTL = Duration.ofDays(3);

    private final StringRedisTemplate redisTemplate;

    public SessionStoreService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void registerSession(String token, String role, String username) {
        if (!StringUtils.hasText(token)) {
            return;
        }

        String normalizedRole = normalizeRole(role);
        String key = buildKey(normalizedRole, token);
        String value = StringUtils.hasText(username) ? username : normalizedRole;
        redisTemplate.opsForValue().set(key, value, resolveTtl(normalizedRole));
    }

    public boolean isSessionActive(String token, String role) {
        if (!StringUtils.hasText(token)) {
            return false;
        }

        String normalizedRole = normalizeRole(role);
        String key = buildKey(normalizedRole, token);
        Boolean exists = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }

    public void refreshSession(String token, String role) {
        if (!StringUtils.hasText(token)) {
            return;
        }

        String normalizedRole = normalizeRole(role);
        String key = buildKey(normalizedRole, token);
        redisTemplate.expire(key, resolveTtl(normalizedRole));
    }

    public void revokeSession(String token, String role) {
        if (!StringUtils.hasText(token)) {
            return;
        }

        String normalizedRole = normalizeRole(role);
        String key = buildKey(normalizedRole, token);
        redisTemplate.delete(key);
    }

    private String buildKey(String normalizedRole, String token) {
        return "session:" + normalizedRole + ":" + token;
    }

    private Duration resolveTtl(String normalizedRole) {
        if ("ADMIN".equals(normalizedRole)) {
            return ADMIN_TTL;
        }
        return CUSTOMER_TTL;
    }

    private String normalizeRole(String role) {
        if (!StringUtils.hasText(role)) {
            return "CUSTOMER";
        }
        return role.trim().toUpperCase();
    }
}
