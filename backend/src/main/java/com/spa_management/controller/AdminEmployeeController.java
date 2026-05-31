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

import com.spa_management.dto.request.EmployeeRequest;
import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.EmployeeResponse;
import com.spa_management.service.AdminEmployeeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/employees")
@RequiredArgsConstructor
@Tag(name = "Admin - Employees", description = "Employee management APIs (Admin only)")
@SecurityRequirement(name = "bearerAuth")
public class AdminEmployeeController {

    private final AdminEmployeeService adminEmployeeService;

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_USER_READ_ALL') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "List all employees")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees() {
        return ResponseEntity.ok(ApiResponse.success(adminEmployeeService.getAllEmployees()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERM_USER_UPDATE_ALL') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody EmployeeRequest request) {
        EmployeeResponse response = adminEmployeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_USER_UPDATE_ALL') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Update an employee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateEmployee(
            @PathVariable UUID id,
            @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Employee updated",
                adminEmployeeService.updateEmployee(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_USER_UPDATE_ALL') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER')")
    @Operation(summary = "Delete (deactivate) an employee")
    public ResponseEntity<Void> deleteEmployee(@PathVariable UUID id) {
        adminEmployeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
