package com.spa_management.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.response.PermissionResponse;
import com.spa_management.entity.Permission;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.repository.PermissionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;

    @Transactional(readOnly = true)
    public List<PermissionResponse> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(PermissionResponse::from)
                .toList();
    }

    /** Trả permissions nhóm theo resource (cho UI checkbox) */
    @Transactional(readOnly = true)
    public Map<String, List<PermissionResponse>> getPermissionsGroupedByResource() {
        return permissionRepository.findAll().stream()
                .map(PermissionResponse::from)
                .collect(Collectors.groupingBy(PermissionResponse::getResource));
    }

    @Transactional
    public PermissionResponse createPermission(String code, String resource, String action, String description) {
        if (permissionRepository.existsByCode(code.toUpperCase())) {
            throw new BusinessException(ErrorCode.PERMISSION_ALREADY_EXISTS);
        }

        Permission permission = Permission.builder()
                .code(code.toUpperCase())
                .resource(resource.toUpperCase())
                .action(action.toUpperCase())
                .description(description)
                .build();

        permission = permissionRepository.save(permission);
        log.info("Created permission: {}", permission.getCode());
        return PermissionResponse.from(permission);
    }

    @Transactional
    public void deletePermission(UUID id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PERMISSION_NOT_FOUND));
        permissionRepository.delete(permission);
        log.info("Deleted permission: {}", permission.getCode());
    }
}
