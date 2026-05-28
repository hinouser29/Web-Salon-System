package com.spa_management.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.request.ChangePasswordRequest;
import com.spa_management.dto.request.ForgotPasswordRequest;
import com.spa_management.dto.request.LoginRequest;
import com.spa_management.dto.request.LogoutRequest;
import com.spa_management.dto.request.RefreshTokenRequest;
import com.spa_management.dto.request.RegisterRequest;
import com.spa_management.dto.request.ResendVerificationRequest;
import com.spa_management.dto.request.ResetPasswordRequest;
import com.spa_management.dto.request.VerifyOtpRequest;
import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.AuthResponse;
import com.spa_management.dto.response.UserProfileResponse;
import com.spa_management.security.JwtCookieHelper;
import com.spa_management.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Registration, login, tokens, and password management")
public class AuthController {

    private final AuthService authService;
    private final JwtCookieHelper jwtCookieHelper;

    @PostMapping("/register")
    @Operation(summary = "Register a new local account")
    public ResponseEntity<ApiResponse<UserProfileResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        UserProfileResponse profile = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Registration successful. Please check your email to verify your account.",
                profile));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify account with OTP")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String message = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification link")
    public ResponseEntity<ApiResponse<String>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        String message = authService.resendVerification(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletResponse httpResponse) {
        AuthResponse response = authService.login(request);
        // Write httpOnly cookies to support browser clients securely.
        jwtCookieHelper.writeAuthCookies(httpResponse, response);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke tokens")
    public ResponseEntity<ApiResponse<String>> logout(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @RequestBody(required = false) LogoutRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse httpResponse) {
        String accessToken = extractBearerToken(authorization);
        if (accessToken == null) {
            accessToken = jwtCookieHelper.resolveAccessToken(httpRequest);
        }
        String refreshToken = request != null ? request.getRefreshToken() : null;
        if (refreshToken == null) {
            refreshToken = jwtCookieHelper.resolveRefreshToken(httpRequest);
        }
        String message = authService.logout(accessToken, refreshToken);
        jwtCookieHelper.clearAuthCookies(httpResponse);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset email")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        String message = authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/verify-reset-otp")
    @Operation(summary = "Verify password reset OTP before setting a new password")
    public ResponseEntity<ApiResponse<String>> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String message = authService.verifyPasswordResetOtp(request);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token from email")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        String message = authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password for authenticated local user")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        String message = authService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success(message, message));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody(required = false) RefreshTokenRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest,
            jakarta.servlet.http.HttpServletResponse httpResponse) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = jwtCookieHelper.resolveRefreshToken(httpRequest);
        }
        AuthResponse response = authService.refresh(refreshToken);
        jwtCookieHelper.writeAuthCookies(httpResponse, response);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    private String extractBearerToken(String authorization) {
        if (authorization != null && authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return null;
    }
}
