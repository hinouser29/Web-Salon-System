package com.spa_management.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.spa_management.dto.request.ChangePasswordRequest;
import com.spa_management.dto.request.ForgotPasswordRequest;
import com.spa_management.dto.request.LoginRequest;
import com.spa_management.dto.request.RegisterRequest;
import com.spa_management.dto.request.ResetPasswordRequest;
import com.spa_management.dto.response.AuthResponse;
import com.spa_management.dto.response.UserProfileResponse;
import com.spa_management.entity.PasswordResetToken;
import com.spa_management.entity.RefreshToken;
import com.spa_management.entity.User;
import com.spa_management.entity.VerificationToken;
import com.spa_management.entity.enums.AuthProvider;
import com.spa_management.entity.enums.Role;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.mapper.UserMapper;
import com.spa_management.repository.UserRepository;
import com.spa_management.security.JwtService;
import com.spa_management.util.PasswordValidator;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidator passwordValidator;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final UserMapper userMapper;

    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        passwordValidator.validate(request.getPassword());

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .provider(AuthProvider.LOCAL)
                .role(Role.USER)
                .verified(false)
                .active(true)
                .build();

        user = userRepository.save(user);

        VerificationToken verificationToken = tokenService.createVerificationToken(user);
        emailService.sendVerificationEmail(user.getEmail(), verificationToken.getToken());

        return userMapper.toProfileResponse(user);
    }

    @Transactional
    public String verifyEmail(String token) {
        VerificationToken verificationToken = tokenService.getValidVerificationToken(token);
        User user = verificationToken.getUser();
        user.setVerified(true);
        userRepository.save(user);
        tokenService.markVerificationTokenUsed(verificationToken);
        return "Email verified successfully. You can now log in.";
    }

    @Transactional
    public String resendVerification(String email) {
        userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
                .filter(user -> user.getProvider() == AuthProvider.LOCAL && !user.isVerified())
                .ifPresent(user -> {
                    VerificationToken token = tokenService.createVerificationToken(user);
                    emailService.sendVerificationEmail(user.getEmail(), token.getToken());
                });
        return "If an unverified account exists for this email, a verification link has been sent.";
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!user.isActive()) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED);
        }
        if (user.getProvider() == AuthProvider.LOCAL && !user.isVerified()) {
            throw new BusinessException(ErrorCode.ACCOUNT_NOT_VERIFIED);
        }
        if (user.getProvider() == AuthProvider.LOCAL) {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword()));
            if (!authentication.isAuthenticated()) {
                throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
            }
        } else {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS,
                    "This account uses Google sign-in. Please log in with Google.");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken stored = tokenService.validateRefreshToken(rawRefreshToken);
        User user = stored.getUser();
        if (!user.isActive()) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED);
        }
        tokenService.revokeRefreshToken(rawRefreshToken);
        return buildAuthResponse(user);
    }

    @Transactional
    public String logout(String accessToken, String refreshToken) {
        if (StringUtils.hasText(accessToken)) {
            tokenService.revokeAccessToken(accessToken);
        }
        if (StringUtils.hasText(refreshToken)) {
            tokenService.revokeRefreshToken(refreshToken);
        }
        return "Logged out successfully";
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                .filter(user -> user.getProvider() == AuthProvider.LOCAL && user.isActive())
                .ifPresent(user -> {
                    PasswordResetToken token = tokenService.createPasswordResetToken(user);
                    emailService.sendPasswordResetEmail(user.getEmail(), token.getToken());
                });
        return "If an account exists for this email, password reset instructions have been sent.";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        passwordValidator.validate(request.getNewPassword());
        PasswordResetToken resetToken = tokenService.getValidPasswordResetToken(request.getToken());
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        tokenService.markPasswordResetTokenUsed(resetToken);
        tokenService.revokeAllRefreshTokensForUser(user);
        return "Password has been reset successfully";
    }

    @Transactional
    public String changePassword(ChangePasswordRequest request) {
        User user = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getProvider() != AuthProvider.LOCAL) {
            throw new BusinessException(ErrorCode.LOCAL_AUTH_REQUIRED);
        }
        if (user.getPassword() == null
                || !passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH);
        }

        passwordValidator.validate(request.getNewPassword());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        tokenService.revokeAllRefreshTokensForUser(user);
        return "Password changed successfully";
    }

    @Transactional
    public AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        tokenService.persistRefreshToken(user, refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationSeconds())
                .user(userMapper.toProfileResponse(user))
                .build();
    }
}
