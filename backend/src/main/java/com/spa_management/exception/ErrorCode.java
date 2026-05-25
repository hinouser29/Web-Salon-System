package com.spa_management.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Validation failed"),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Bad request"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "Access denied"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    CONFLICT(HttpStatus.CONFLICT, "Resource conflict"),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),

    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email is already registered"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid email or password"),
    ACCOUNT_NOT_VERIFIED(HttpStatus.FORBIDDEN, "Please verify your email before logging in"),
    ACCOUNT_DISABLED(HttpStatus.FORBIDDEN, "Account is disabled"),
    INVALID_TOKEN(HttpStatus.BAD_REQUEST, "Invalid or expired token"),
    TOKEN_ALREADY_USED(HttpStatus.BAD_REQUEST, "Token has already been used"),
    TOKEN_REVOKED(HttpStatus.UNAUTHORIZED, "Token has been revoked"),
    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "Current password is incorrect"),
    OAUTH2_ERROR(HttpStatus.BAD_REQUEST, "OAuth2 authentication failed"),
    FILE_UPLOAD_ERROR(HttpStatus.BAD_REQUEST, "File upload failed"),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "Invalid file type"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    LOCAL_AUTH_REQUIRED(HttpStatus.BAD_REQUEST, "Password change is only available for local accounts");

    private final HttpStatus httpStatus;
    private final String defaultMessage;
}
