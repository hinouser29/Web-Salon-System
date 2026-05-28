package com.spa_management.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.BranchResponse;
import com.spa_management.dto.response.ServiceResponse;
import com.spa_management.dto.response.TechnicianResponse;
import com.spa_management.service.CatalogService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Catalog", description = "Public salon catalog APIs")
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/services")
    @Operation(summary = "List active services")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> listServices() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.listActiveServices()));
    }

    @GetMapping("/services/{id}")
    @Operation(summary = "Get service detail")
    public ResponseEntity<ApiResponse<ServiceResponse>> getService(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getActiveService(id)));
    }

    @GetMapping("/branches")
    @Operation(summary = "List branches")
    public ResponseEntity<ApiResponse<List<BranchResponse>>> listBranches() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.listBranches()));
    }

    @GetMapping("/technicians")
    @Operation(summary = "List technicians, optionally filtered by branch")
    public ResponseEntity<ApiResponse<List<TechnicianResponse>>> listTechnicians(
            @RequestParam(required = false) UUID branchId) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.listTechnicians(branchId)));
    }
}
