package com.fishbreeding.backend.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class SessionStoreService {

    private static final Duration ADMIN_TTL = Duration.ofHours(4);
    private static final Duration CUSTOMER_TTL = Duration.ofDays(3);

    private final StringRedisTemplate redisTemplate;
    private final boolean enabled;

    public SessionStoreService(StringRedisTemplate redisTemplate,
                               @Value("${app.session.store.enabled:true}") boolean enabled) {
        this.redisTemplate = redisTemplate;
        this.enabled = enabled;
    }

    public void registerSession(String token, String role, String username) {
        if (!enabled || !StringUtils.hasText(token)) {
            return;
        }

        String normalizedRole = normalizeRole(role);
        String key = buildKey(normalizedRole, token);
        String value = StringUtils.hasText(username) ? username : normalizedRole;
        redisTemplate.opsForValue().set(key, value, resolveTtl(normalizedRole));
    }

    public boolean isSessionActive(String token, String role) {
        if (!enabled) {
            return true;
        }
        if (!StringUtils.hasText(token)) {
            return false;
        }

        String normalizedRole = normalizeRole(role);
        String key = buildKey(normalizedRole, token);
        Boolean exists = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }

    public void refreshSession(String token, String role) {
        if (!enabled || !StringUtils.hasText(token)) {
            return;
        }

        String normalizedRole = normalizeRole(role);
        String key = buildKey(normalizedRole, token);
        redisTemplate.expire(key, resolveTtl(normalizedRole));
    }

    public void revokeSession(String token, String role) {
        if (!enabled || !StringUtils.hasText(token)) {
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
