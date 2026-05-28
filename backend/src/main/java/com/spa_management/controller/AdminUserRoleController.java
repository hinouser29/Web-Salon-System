package com.spa_management.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.request.AssignRoleRequest;
import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.UserRoleResponse;
import com.spa_management.service.UserRoleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - User Roles", description = "User-Role assignment APIs (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AdminUserRoleController {

    private final UserRoleService userRoleService;

    @GetMapping("/{userId}/roles")
    @Operation(summary = "Get all roles assigned to a user")
    public ResponseEntity<ApiResponse<List<UserRoleResponse>>> getUserRoles(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(userRoleService.getUserRoles(userId)));
    }

    @PostMapping("/{userId}/roles")
    @Operation(summary = "Assign a role to a user")
    public ResponseEntity<ApiResponse<UserRoleResponse>> assignRole(
            @PathVariable UUID userId, @Valid @RequestBody AssignRoleRequest request) {
        UserRoleResponse response = userRoleService.assignRole(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Role assigned", response));
    }

    @DeleteMapping("/{userId}/roles/{roleId}")
    @Operation(summary = "Revoke a role from a user")
    public ResponseEntity<Void> revokeRole(@PathVariable UUID userId, @PathVariable UUID roleId) {
        userRoleService.revokeRole(userId, roleId);
        return ResponseEntity.noContent().build();
    }
}
