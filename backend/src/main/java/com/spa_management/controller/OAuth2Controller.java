package com.spa_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/oauth2")
@Tag(name = "OAuth2", description = "Google OAuth2 login helpers")
public class OAuth2Controller {

    @GetMapping("/google")
    @Operation(summary = "Google OAuth2 login entry point",
            description = "Redirects to Google. After success, Spring redirects to the frontend callback with JWT tokens in query parameters.")
    public ResponseEntity<ApiResponse<String>> googleLoginInfo() {
        return ResponseEntity.ok(ApiResponse.success(
                "Initiate Google login at /oauth2/authorization/google",
                "/oauth2/authorization/google"));
    }
}
