package com.spa_management.service;

import java.time.Duration;
import java.time.Instant;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.spa_management.dto.request.ChangePasswordRequest;
import com.spa_management.dto.request.ForgotPasswordRequest;
import com.spa_management.dto.request.LoginRequest;
import com.spa_management.dto.request.RegisterRequest;
import com.spa_management.dto.request.ResetPasswordRequest;
import com.spa_management.dto.request.VerifyOtpRequest;
import com.spa_management.dto.response.AuthResponse;
import com.spa_management.dto.response.UserProfileResponse;
import com.spa_management.entity.PasswordResetToken;
import com.spa_management.entity.RefreshToken;
import com.spa_management.entity.User;
import com.spa_management.entity.UserRole;
import com.spa_management.entity.Customer;
import com.spa_management.entity.VerificationToken;
import com.spa_management.entity.enums.AuthProvider;
import com.spa_management.entity.enums.Role;
import com.spa_management.entity.enums.UserStatus;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.mapper.UserMapper;
import com.spa_management.repository.RoleRepository;
import com.spa_management.repository.UserRepository;
import com.spa_management.repository.UserRoleRepository;
import com.spa_management.repository.CustomerRepository;
import com.spa_management.security.JwtService;
import com.spa_management.util.PasswordValidator;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final Duration LOGIN_LOCK_DURATION = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordValidator passwordValidator;

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private AuthenticationManager authenticationManager;

    private final JwtService jwtService;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final UserMapper userMapper;

    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(email).ifPresent(existingUser -> {
            if (existingUser.isVerified()) {
                throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
            } else {
                // Delete existing unverified user data to allow re-registration
                customerRepository.deleteByUserId(existingUser.getId());
                userRoleRepository.deleteByUserId(existingUser.getId());
                tokenService.deleteAllTokensForUser(existingUser);
                userRepository.delete(existingUser);
                userRepository.flush();
            }
        });

        passwordValidator.validate(request.getPassword());

        Role requestedRole;
        try {
            requestedRole = request.getRole() != null ? Role.valueOf(request.getRole().toUpperCase()) : Role.USER;
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid role selected");
        }

        // Restrict which roles can be registered from the public endpoint
        if (requestedRole != Role.SUPER_ADMIN && requestedRole != Role.STAFF && requestedRole != Role.SUPPORT && requestedRole != Role.USER && requestedRole != Role.CUSTOMER) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Registration not allowed for this role");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .provider(AuthProvider.LOCAL)
                .role(requestedRole)
                .verified(false)
                .status(UserStatus.INACTIVE)
                .build();

        final User savedUser = userRepository.save(user);

        // RBAC: Gán role từ bảng roles
        roleRepository.findByName(requestedRole.name()).ifPresent(dbRole -> {
            UserRole userRole = UserRole.builder()
                    .user(savedUser)
                    .role(dbRole)
                    .build();
            userRoleRepository.save(userRole);
        });

        Customer customer = Customer.builder()
                .user(savedUser)
                .gender(request.getGender() != null ? request.getGender().name() : null)
                .birthday(request.getDateOfBirth())
                .address(request.getAddress())
                .loyaltyPoints(0)
                .build();
        customer = customerRepository.save(customer);

        VerificationToken verificationToken = tokenService.createVerificationToken(savedUser);
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken.getToken());

        return userMapper.toProfileResponse(savedUser, customer);
    }

    @Transactional
    public String verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN, "OTP does not match the provided email."));

        tokenService.validateVerificationToken(user, request.getOtp());

        user.setVerified(true);
        if (user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.STAFF || user.getRole() == Role.SUPPORT) {
            user.setStatus(UserStatus.PENDING);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }
        userRepository.save(user);
        
        if (user.getStatus() == UserStatus.PENDING) {
            return "Xác thực email thành công. Tài khoản của bạn đang chờ Quản trị viên duyệt.";
        }
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
        return "If an unverified account exists for this email, a new OTP has been sent.";
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (user.getStatus() == UserStatus.PENDING || (user.getProvider() == AuthProvider.LOCAL && !user.isVerified())) {
            throw new BusinessException(ErrorCode.ACCOUNT_NOT_VERIFIED);
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.ACCOUNT_DISABLED);
        }
        ensureLoginAllowed(user);
        if (user.getProvider() == AuthProvider.LOCAL) {
            try {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(email, request.getPassword()));
                if (!authentication.isAuthenticated()) {
                    recordFailedLogin(user);
                    throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
                }
                resetFailedLogin(user);
            } catch (AuthenticationException ex) {
                recordFailedLogin(user);
                throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
            }
        } else {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS,
                    "This account uses Google sign-in. Please log in with Google.");
        }

        return buildAuthResponse(user);
    }

    private void ensureLoginAllowed(User user) {
        Instant lockedUntil = user.getLockedUntil();
        if (lockedUntil == null) {
            return;
        }

        if (lockedUntil.isAfter(Instant.now())) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED,
                    "Too many failed login attempts. Try again after " + lockedUntil + ".");
        }

        user.setLockedUntil(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
    }

    private void recordFailedLogin(User user) {
        int failedAttempts = user.getFailedLoginAttempts() + 1;
        user.setFailedLoginAttempts(failedAttempts);
        if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
            user.setLockedUntil(Instant.now().plus(LOGIN_LOCK_DURATION));
        }
        userRepository.save(user);
        if (user.getLockedUntil() != null) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED,
                    "Too many failed login attempts. Try again after " + user.getLockedUntil() + ".");
        }
    }

    private void resetFailedLogin(User user) {
        if (user.getFailedLoginAttempts() == 0 && user.getLockedUntil() == null) {
            return;
        }
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken stored = tokenService.validateRefreshToken(rawRefreshToken);
        User user = stored.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
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
                .filter(user -> user.getProvider() == AuthProvider.LOCAL && user.getStatus() == UserStatus.ACTIVE)
                .ifPresent(user -> {
                    PasswordResetToken token = tokenService.createPasswordResetToken(user);
                    emailService.sendPasswordResetEmail(user.getEmail(), token.getToken());
                });
        return "If an account exists for this email, an OTP has been sent.";
    }

    @Transactional
    public String verifyPasswordResetOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN, "OTP does not match the provided email."));

        tokenService.validatePasswordResetToken(user, request.getOtp());

        return "Password reset OTP is valid.";
    }

    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        passwordValidator.validate(request.getNewPassword());
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN, "OTP does not match the provided email."));

        tokenService.validatePasswordResetToken(user, request.getOtp());

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
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

        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirationSeconds())
                .user(userMapper.toProfileResponse(user, customer))
                .build();
    }
}
