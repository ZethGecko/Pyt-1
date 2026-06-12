package com.example.demo.security;

import jakarta.annotation.PostConstruct;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${JWT_SECRET}")
    private String SECRET_KEY;

    @Value("${JWT_EXPIRATION:2592000000}")
    private Long EXPIRATION_TIME;

    @PostConstruct
    public void validateSecret() {
        if (SECRET_KEY == null
                || SECRET_KEY.isBlank()
                || SECRET_KEY.length() < 32
                || "local_dev_jwt_secret_at_least_32_chars".equals(SECRET_KEY)) {
            throw new IllegalStateException("Set JWT_SECRET to a secure value with at least 32 characters.");
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(String username, Long userId, String role, Integer tokenVersion) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("tokenVersion", tokenVersion);
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public Boolean validateToken(String token, Integer tokenVersionFromDb) {
        final String username = extractUsername(token);
        if (isTokenExpired(token)) {
            return false;
        }
        // Validar tokenVersion
        Claims claims = extractAllClaims(token);
        Integer tokenVersionFromToken = claims.get("tokenVersion", Integer.class);
        if (tokenVersionFromToken == null || !tokenVersionFromToken.equals(tokenVersionFromDb)) {
            return false;
        }
        return true;
    }
}
