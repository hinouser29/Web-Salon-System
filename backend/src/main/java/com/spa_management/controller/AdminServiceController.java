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

import com.spa_management.dto.request.SalonServiceRequest;
import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.ServiceResponse;
import com.spa_management.service.AdminCatalogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/services")
@RequiredArgsConstructor
@Tag(name = "Admin - Services", description = "Service management APIs (Admin/Manager)")
@SecurityRequirement(name = "bearerAuth")
public class AdminServiceController {

    private final AdminCatalogService adminCatalogService;

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_SERVICE_READ') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "List all services (including inactive)")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllServices() {
        return ResponseEntity.ok(ApiResponse.success(adminCatalogService.getAllServices()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERM_SERVICE_CREATE') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new service")
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(
            @Valid @RequestBody SalonServiceRequest request) {
        ServiceResponse response = adminCatalogService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_SERVICE_UPDATE') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update an existing service")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateService(
            @PathVariable UUID id,
            @Valid @RequestBody SalonServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Service updated",
                adminCatalogService.updateService(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_SERVICE_DELETE') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Delete (deactivate) a service")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        adminCatalogService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}
