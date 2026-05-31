package com.spa_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.TechnicianKPIResponse;
import com.spa_management.service.TechnicianKPIService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/technician")
@RequiredArgsConstructor
public class TechnicianKPIController {

    private final TechnicianKPIService technicianKPIService;

    @GetMapping("/kpi")
    @PreAuthorize("hasAnyAuthority('TECHNICIAN', 'STAFF', 'SUPPORT')")
    public ResponseEntity<ApiResponse<TechnicianKPIResponse>> getMyKPI() {
        return ResponseEntity.ok(ApiResponse.success(technicianKPIService.getMyKPI()));
    }
}
