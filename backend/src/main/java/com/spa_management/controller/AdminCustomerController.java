package com.spa_management.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.AdminCustomerResponse;
import com.spa_management.service.AdminCustomerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@Tag(name = "Admin - Customers", description = "Customer management APIs (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_USER_READ_ALL') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST')")
    @Operation(summary = "List all customers")
    public ResponseEntity<ApiResponse<List<AdminCustomerResponse>>> getAllCustomers() {
        return ResponseEntity.ok(ApiResponse.success(adminCustomerService.getAllCustomers()));
    }
}
