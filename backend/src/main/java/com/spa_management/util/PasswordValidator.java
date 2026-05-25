package com.spa_management.util;

import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;

@Component
public class PasswordValidator {

    private static final Pattern HAS_UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern HAS_LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern HAS_DIGIT = Pattern.compile("\\d");
    private static final Pattern HAS_SPECIAL = Pattern.compile("[^A-Za-z0-9]");

    public void validate(String password) {
        if (password == null || password.length() < 8) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Password must be at least 8 characters long");
        }
        if (password.length() > 100) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Password must not exceed 100 characters");
        }
        if (!HAS_UPPERCASE.matcher(password).find()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Password must contain at least one uppercase letter");
        }
        if (!HAS_LOWERCASE.matcher(password).find()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Password must contain at least one lowercase letter");
        }
        if (!HAS_DIGIT.matcher(password).find()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Password must contain at least one digit");
        }
        if (!HAS_SPECIAL.matcher(password).find()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR,
                    "Password must contain at least one special character");
        }
    }
}
