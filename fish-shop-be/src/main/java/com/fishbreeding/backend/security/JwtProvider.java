package com.fishbreeding.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtProvider {

    private static final long ADMIN_EXPIRATION_MILLIS = 4 * 60 * 60 * 1000L;
    private static final long CUSTOMER_EXPIRATION_MILLIS = 3 * 24 * 60 * 60 * 1000L;

    private final SecretKey signingKey;

    public JwtProvider(@Value("${app.jwt.secret}") String jwtSecret) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String generateToken(String username, String role) {
        String normalizedRole = normalizeRole(role);
        Instant now = Instant.now();
        long expirationMillis = getExpirationMillisByRole(normalizedRole);

        return Jwts.builder()
                .subject(username)
                .claim("role", normalizedRole)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMillis)))
                .signWith(signingKey)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        Object role = extractAllClaims(token).get("role");
        return role == null ? "" : role.toString();
    }

    public boolean validateToken(String token) {
        extractAllClaims(token);
        return true;
    }

    private long getExpirationMillisByRole(String normalizedRole) {
        if ("ADMIN".equals(normalizedRole)) {
            return ADMIN_EXPIRATION_MILLIS;
        }
        if ("CUSTOMER".equals(normalizedRole)) {
            return CUSTOMER_EXPIRATION_MILLIS;
        }
        return CUSTOMER_EXPIRATION_MILLIS;
    }

    private String normalizeRole(String role) {
        return role == null ? "CUSTOMER" : role.trim().toUpperCase();
    }
}
