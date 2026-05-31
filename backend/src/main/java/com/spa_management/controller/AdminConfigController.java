package com.spa_management.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.request.SystemConfigRequest;
import com.spa_management.dto.response.ApiResponse;
import com.spa_management.service.AdminConfigService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/configs")
@RequiredArgsConstructor
@Tag(name = "Admin - Configs", description = "System settings management (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AdminConfigController {

    private final AdminConfigService adminConfigService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Get all system configurations")
    public ResponseEntity<ApiResponse<Map<String, String>>> getAllConfigs() {
        return ResponseEntity.ok(ApiResponse.success(adminConfigService.getAllConfigs()));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Update system configurations")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateConfigs(@RequestBody SystemConfigRequest request) {
        return ResponseEntity.ok(ApiResponse.success(adminConfigService.updateConfigs(request)));
    }
}
