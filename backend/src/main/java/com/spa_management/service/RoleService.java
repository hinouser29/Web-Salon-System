package com.spa_management.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.request.RoleRequest;
import com.spa_management.dto.response.PermissionResponse;
import com.spa_management.dto.response.RoleResponse;
import com.spa_management.entity.Permission;
import com.spa_management.entity.Role;
import com.spa_management.entity.RolePermission;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.repository.PermissionRepository;
import com.spa_management.repository.RolePermissionRepository;
import com.spa_management.repository.RoleRepository;
import com.spa_management.repository.UserRepository;
import com.spa_management.repository.UserRoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserRepository userRepository;
    private final SystemLogService systemLogService;

    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoleResponse getRoleById(UUID id) {
        Role role = findRoleOrThrow(id);
        RoleResponse response = toResponse(role);
        // Kèm danh sách permissions
        List<PermissionResponse> permissions = role.getRolePermissions().stream()
                .map(rp -> PermissionResponse.from(rp.getPermission()))
                .toList();
        response.setPermissions(permissions);
        return response;
    }

    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.existsByName(request.getName().toUpperCase())) {
            throw new BusinessException(ErrorCode.ROLE_ALREADY_EXISTS);
        }

        Role role = Role.builder()
                .name(request.getName().toUpperCase())
                .displayName(request.getDisplayName())
                .description(request.getDescription())
                .system(false) // Custom roles are never system
                .build();

        role = roleRepository.save(role);
        log.info("Created new role: {}", role.getName());
        systemLogService.logAction("CREATE_ROLE", "Tạo nhóm quyền mới: " + role.getName());
        return toResponse(role);
    }

    @Transactional
    public RoleResponse updateRole(UUID id, RoleRequest request) {
        Role role = findRoleOrThrow(id);
        if (role.isSystem()) {
            throw new BusinessException(ErrorCode.SYSTEM_ROLE_PROTECTED);
        }

        role.setDisplayName(request.getDisplayName());
        role.setDescription(request.getDescription());
        role = roleRepository.save(role);
        log.info("Updated role: {}", role.getName());
        systemLogService.logAction("UPDATE_ROLE", "Cập nhật nhóm quyền: " + role.getName());
        return toResponse(role);
    }

    @Transactional
    public void deleteRole(UUID id) {
        Role role = findRoleOrThrow(id);
        if (role.isSystem()) {
            throw new BusinessException(ErrorCode.SYSTEM_ROLE_PROTECTED);
        }
        roleRepository.delete(role);
        log.info("Deleted role: {}", role.getName());
        systemLogService.logAction("DELETE_ROLE", "Xóa nhóm quyền: " + role.getName());
    }

    // ==================== Role-Permission Assignment ====================

    @Transactional(readOnly = true)
    public List<PermissionResponse> getRolePermissions(UUID roleId) {
        findRoleOrThrow(roleId);
        return rolePermissionRepository.findByRoleId(roleId).stream()
                .map(rp -> PermissionResponse.from(rp.getPermission()))
                .toList();
    }

    @Transactional
    public RoleResponse assignPermissionsToRole(UUID roleId, List<UUID> permissionIds) {
        Role role = findRoleOrThrow(roleId);

        for (UUID permId : permissionIds) {
            if (rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permId)) {
                continue; // Bỏ qua nếu đã có
            }
            Permission perm = permissionRepository.findById(permId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.PERMISSION_NOT_FOUND));

            RolePermission rp = RolePermission.builder()
                    .role(role)
                    .permission(perm)
                    .build();
            rolePermissionRepository.save(rp);
        }

        // Tăng permissions_version cho tất cả users có role này
        incrementPermissionsVersionForRole(roleId);

        log.info("Assigned {} permissions to role {}", permissionIds.size(), role.getName());
        systemLogService.logAction("ASSIGN_PERMISSION", "Gán " + permissionIds.size() + " quyền cho nhóm: " + role.getName());
        return getRoleById(roleId);
    }

    @Transactional
    public void revokePermissionFromRole(UUID roleId, UUID permissionId) {
        findRoleOrThrow(roleId);
        rolePermissionRepository.deleteByRoleIdAndPermissionId(roleId, permissionId);

        // Tăng permissions_version cho tất cả users có role này
        incrementPermissionsVersionForRole(roleId);

        log.info("Revoked permission {} from role {}", permissionId, roleId);
        systemLogService.logAction("REVOKE_PERMISSION", "Thu hồi quyền khỏi nhóm có ID: " + roleId);
    }

    // ==================== Helpers ====================

    private Role findRoleOrThrow(UUID id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));
    }

    /** Tăng permissions_version cho tất cả users có role bị thay đổi */
    private void incrementPermissionsVersionForRole(UUID roleId) {
        userRoleRepository.findAll().stream()
                .filter(ur -> ur.getRole().getId().equals(roleId))
                .map(ur -> ur.getUser().getId())
                .distinct()
                .forEach(userId -> userRepository.findById(userId).ifPresent(user -> {
                    user.setPermissionsVersion(user.getPermissionsVersion() + 1);
                    userRepository.save(user);
                }));
    }

    private RoleResponse toResponse(Role role) {
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .displayName(role.getDisplayName())
                .description(role.getDescription())
                .system(role.isSystem())
                .createdAt(role.getCreatedAt())
                .build();
    }
}
