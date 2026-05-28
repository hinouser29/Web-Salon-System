package com.spa_management.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.config.AppProperties;
import com.spa_management.entity.PasswordResetToken;
import com.spa_management.entity.RefreshToken;
import com.spa_management.entity.RevokedToken;
import com.spa_management.entity.User;
import com.spa_management.entity.VerificationToken;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.repository.PasswordResetTokenRepository;
import com.spa_management.repository.RefreshTokenRepository;
import com.spa_management.repository.RevokedTokenRepository;
import com.spa_management.repository.VerificationTokenRepository;
import com.spa_management.security.JwtService;
import com.spa_management.util.SecurityUtils;
import com.spa_management.util.TokenGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final AppProperties appProperties;
    private final TokenGenerator tokenGenerator;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RevokedTokenRepository revokedTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Transactional
    public VerificationToken createVerificationToken(User user) {
        verificationTokenRepository.deleteByUser(user);
        VerificationToken token = VerificationToken.builder()
                .token(tokenGenerator.generateOtp())
                .user(user)
                .expiresAt(Instant.now().plus(
                        appProperties.getOtpExpirationMinutes(), ChronoUnit.MINUTES))
                .build();
        return verificationTokenRepository.save(token);
    }

    @Transactional
    public void validateVerificationToken(User user, String rawToken) {
        VerificationToken token = verificationTokenRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN, "No active OTP found for this user."));

        if (token.isUsed()) {
            throw new BusinessException(ErrorCode.TOKEN_ALREADY_USED);
        }
        if (token.isExpired()) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN, "Verification token has expired.");
        }

        if (!token.getToken().equals(rawToken)) {
            token.setFailedAttempts(token.getFailedAttempts() + 1);
            if (token.getFailedAttempts() >= 5) {
                token.setExpiresAt(Instant.now().minusSeconds(1)); // Revoke it
                verificationTokenRepository.save(token);
                throw new BusinessException(ErrorCode.INVALID_TOKEN, "Too many failed attempts. The OTP has been revoked. Please request a new one.");
            }
            verificationTokenRepository.save(token);
            throw new BusinessException(ErrorCode.INVALID_TOKEN, "Invalid OTP.");
        }

        token.setUsedAt(Instant.now());
        verificationTokenRepository.save(token);
    }

    @Transactional
    public PasswordResetToken createPasswordResetToken(User user) {
        passwordResetTokenRepository.deleteByUser(user);
        PasswordResetToken token = PasswordResetToken.builder()
                .token(tokenGenerator.generateOtp())
                .user(user)
                .expiresAt(Instant.now().plus(
                        appProperties.getOtpExpirationMinutes(), ChronoUnit.MINUTES))
                .build();
        return passwordResetTokenRepository.save(token);
    }

    @Transactional
    public void validatePasswordResetToken(User user, String rawToken) {
        PasswordResetToken token = passwordResetTokenRepository.findByUser(user)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN, "No active password reset OTP found for this user."));

        if (token.isUsed()) {
            throw new BusinessException(ErrorCode.TOKEN_ALREADY_USED);
        }
        if (token.isExpired()) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN, "Password reset token has expired.");
        }

        if (!token.getToken().equals(rawToken)) {
            token.setFailedAttempts(token.getFailedAttempts() + 1);
            if (token.getFailedAttempts() >= 5) {
                token.setExpiresAt(Instant.now().minusSeconds(1)); // Revoke it
                passwordResetTokenRepository.save(token);
                throw new BusinessException(ErrorCode.INVALID_TOKEN, "Too many failed attempts. The OTP has been revoked. Please request a new one.");
            }
            passwordResetTokenRepository.save(token);
            throw new BusinessException(ErrorCode.INVALID_TOKEN, "Invalid OTP.");
        }

        token.setUsedAt(Instant.now());
        passwordResetTokenRepository.save(token);
    }

    @Transactional
    public RefreshToken persistRefreshToken(User user, String rawRefreshToken) {
        RefreshToken entity = RefreshToken.builder()
                .tokenHash(SecurityUtils.sha256Hex(rawRefreshToken))
                .user(user)
                .expiresAt(Instant.now().plusMillis(appProperties.getJwt().getRefreshTokenExpirationMs()))
                .build();
        return refreshTokenRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(String rawRefreshToken) {
        RefreshToken stored = refreshTokenRepository
                .findByTokenHash(SecurityUtils.sha256Hex(rawRefreshToken))
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN, "Invalid refresh token"));

        if (stored.isRevoked()) {
            throw new BusinessException(ErrorCode.TOKEN_REVOKED);
        }
        if (stored.isExpired()) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN, "Refresh token has expired");
        }
        if (!jwtService.isTokenValid(rawRefreshToken) || !jwtService.isRefreshToken(rawRefreshToken)) {
            throw new BusinessException(ErrorCode.INVALID_TOKEN, "Invalid refresh token");
        }
        return stored;
    }

    @Transactional
    public void revokeRefreshToken(String rawRefreshToken) {
        refreshTokenRepository.findByTokenHash(SecurityUtils.sha256Hex(rawRefreshToken))
                .ifPresent(token -> {
                    token.setRevokedAt(Instant.now());
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void revokeAllRefreshTokensForUser(User user) {
        refreshTokenRepository.revokeAllByUser(user, Instant.now());
    }

    @Transactional
    public void deleteAllTokensForUser(User user) {
        verificationTokenRepository.deleteByUser(user);
        passwordResetTokenRepository.deleteByUser(user);
        refreshTokenRepository.deleteByUser(user);
    }

    @Transactional
    public void revokeAccessToken(String accessToken) {
        if (!jwtService.isTokenValid(accessToken) || !jwtService.isAccessToken(accessToken)) {
            return;
        }
        String jti = jwtService.getJti(accessToken);
        Instant expiresAt = jwtService.getExpiration(accessToken);
        if (jti == null || expiresAt == null || revokedTokenRepository.existsByJti(jti)) {
            return;
        }
        revokedTokenRepository.save(RevokedToken.builder()
                .jti(jti)
                .expiresAt(expiresAt)
                .build());
    }
}
