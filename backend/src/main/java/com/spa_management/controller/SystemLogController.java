package com.spa_management.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.SystemLogResponse;
import com.spa_management.service.SystemLogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/system-logs")
@RequiredArgsConstructor
public class SystemLogController {

    private final SystemLogService systemLogService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<SystemLogResponse>>> getSystemLogs(
            @PageableDefault(size = 20) Pageable pageable) {
        
        Page<SystemLogResponse> logs = systemLogService.getSystemLogs(pageable);
        
        return ResponseEntity.ok(ApiResponse.success("Success", logs));
    }
}
