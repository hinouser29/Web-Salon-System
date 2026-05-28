package com.spa_management.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.PermissionResponse;
import com.spa_management.service.PermissionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Permissions", description = "Permission management APIs (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AdminPermissionController {

    private final PermissionService permissionService;

    @GetMapping
    @Operation(summary = "Get all permissions")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getAllPermissions() {
        return ResponseEntity.ok(ApiResponse.success(permissionService.getAllPermissions()));
    }

    @GetMapping("/grouped")
    @Operation(summary = "Get all permissions grouped by resource")
    public ResponseEntity<ApiResponse<Map<String, List<PermissionResponse>>>> getGroupedPermissions() {
        return ResponseEntity.ok(ApiResponse.success(permissionService.getPermissionsGroupedByResource()));
    }

    @PostMapping
    @Operation(summary = "Create a new permission")
    public ResponseEntity<ApiResponse<PermissionResponse>> createPermission(
            @RequestParam String code,
            @RequestParam String resource,
            @RequestParam String action,
            @RequestParam(required = false) String description) {
        PermissionResponse response = permissionService.createPermission(code, resource, action, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Permission created", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a permission")
    public ResponseEntity<Void> deletePermission(@PathVariable UUID id) {
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }
}
