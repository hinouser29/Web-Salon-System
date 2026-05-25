package com.spa_management.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.spa_management.config.AppProperties;
import com.spa_management.entity.User;
import com.spa_management.repository.RevokedTokenRepository;
import com.spa_management.util.TokenGenerator;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

    public static final String CLAIM_USER_ID = "uid";
    public static final String CLAIM_EMAIL = "email";
    public static final String CLAIM_TYPE = "type";
    public static final String TYPE_ACCESS = "access";
    public static final String TYPE_REFRESH = "refresh";

    private final AppProperties appProperties;
    private final TokenGenerator tokenGenerator;
    private final RevokedTokenRepository revokedTokenRepository;

    public String generateAccessToken(User user) {
        return buildToken(user, TYPE_ACCESS, appProperties.getJwt().getAccessTokenExpirationMs());
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, TYPE_REFRESH, appProperties.getJwt().getRefreshTokenExpirationMs());
    }

    private String buildToken(User user, String type, long expirationMs) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(expirationMs);
        String jti = tokenGenerator.generateJti();

        return Jwts.builder()
                .id(jti)
                .subject(user.getEmail())
                .claim(CLAIM_USER_ID, user.getId())
                .claim(CLAIM_EMAIL, user.getEmail())
                .claim(CLAIM_TYPE, type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            String jti = claims.getId();
            if (jti != null && revokedTokenRepository.existsByJti(jti)) {
                return false;
            }
            return !claims.getExpiration().before(new Date());
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    public boolean isAccessToken(String token) {
        return TYPE_ACCESS.equals(getTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return TYPE_REFRESH.equals(getTokenType(token));
    }

    public String getTokenType(String token) {
        return parseClaims(token).get(CLAIM_TYPE, String.class);
    }

    public Long getUserId(String token) {
        Number uid = parseClaims(token).get(CLAIM_USER_ID, Number.class);
        return uid != null ? uid.longValue() : null;
    }

    public String getEmail(String token) {
        return parseClaims(token).get(CLAIM_EMAIL, String.class);
    }

    public String getJti(String token) {
        return parseClaims(token).getId();
    }

    public Instant getExpiration(String token) {
        Date expiration = parseClaims(token).getExpiration();
        return expiration != null ? expiration.toInstant() : null;
    }

    public long getAccessTokenExpirationSeconds() {
        return appProperties.getJwt().getAccessTokenExpirationMs() / 1000;
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = appProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
