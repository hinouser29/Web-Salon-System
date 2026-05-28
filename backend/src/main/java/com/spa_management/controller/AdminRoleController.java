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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.request.AssignPermissionsRequest;
import com.spa_management.dto.request.RoleRequest;
import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.PermissionResponse;
import com.spa_management.dto.response.RoleResponse;
import com.spa_management.service.RoleService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Roles", description = "Role management APIs (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AdminRoleController {

    private final RoleService roleService;

    @GetMapping
    @Operation(summary = "Get all roles")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles() {
        return ResponseEntity.ok(ApiResponse.success(roleService.getAllRoles()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID with permissions")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(roleService.getRoleById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new role")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@Valid @RequestBody RoleRequest request) {
        RoleResponse response = roleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Role created", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a role")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @PathVariable UUID id, @Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role updated", roleService.updateRole(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a role (non-system only)")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        roleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Role-Permission Assignment ====================

    @GetMapping("/{id}/permissions")
    @Operation(summary = "Get permissions assigned to a role")
    public ResponseEntity<ApiResponse<List<PermissionResponse>>> getRolePermissions(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(roleService.getRolePermissions(id)));
    }

    @PostMapping("/{id}/permissions")
    @Operation(summary = "Assign permissions to a role")
    public ResponseEntity<ApiResponse<RoleResponse>> assignPermissions(
            @PathVariable UUID id, @Valid @RequestBody AssignPermissionsRequest request) {
        RoleResponse response = roleService.assignPermissionsToRole(id, request.getPermissionIds());
        return ResponseEntity.ok(ApiResponse.success("Permissions assigned", response));
    }

    @DeleteMapping("/{roleId}/permissions/{permId}")
    @Operation(summary = "Revoke a permission from a role")
    public ResponseEntity<Void> revokePermission(
            @PathVariable UUID roleId, @PathVariable UUID permId) {
        roleService.revokePermissionFromRole(roleId, permId);
        return ResponseEntity.noContent().build();
    }
}
