package com.spa_management.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.request.AssignRoleRequest;
import com.spa_management.dto.response.UserRoleResponse;
import com.spa_management.entity.Role;
import com.spa_management.entity.User;
import com.spa_management.entity.UserRole;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.repository.RoleRepository;
import com.spa_management.repository.UserRepository;
import com.spa_management.repository.UserRoleRepository;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserRoleService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Transactional(readOnly = true)
    public List<UserRoleResponse> getUserRoles(UUID userId) {
        findUserOrThrow(userId);
        return userRoleRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserRoleResponse assignRole(UUID userId, AssignRoleRequest request) {
        User user = findUserOrThrow(userId);
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));

        if (userRoleRepository.existsByUserIdAndRoleId(userId, role.getId())) {
            throw new BusinessException(ErrorCode.ROLE_ALREADY_ASSIGNED);
        }

        UUID assignedBy = SecurityUtils.getCurrentUserId();

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(role)
                .assignedBy(assignedBy)
                .expiresAt(request.getExpiresAt())
                .build();

        userRole = userRoleRepository.save(userRole);

        // Tăng permissions_version → JWT hiện tại sẽ bị reload authorities
        user.setPermissionsVersion(user.getPermissionsVersion() + 1);
        userRepository.save(user);

        log.info("Assigned role {} to user {}, by admin {}", role.getName(), userId, assignedBy);
        return toResponse(userRole);
    }

    @Transactional
    public void revokeRole(UUID userId, UUID roleId) {
        User user = findUserOrThrow(userId);

        userRoleRepository.findByUserIdAndRoleId(userId, roleId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND,
                        "User does not have this role"));

        userRoleRepository.deleteByUserIdAndRoleId(userId, roleId);

        // Tăng permissions_version
        user.setPermissionsVersion(user.getPermissionsVersion() + 1);
        userRepository.save(user);

        log.info("Revoked role {} from user {}", roleId, userId);
    }

    // ==================== Helpers ====================

    private User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private UserRoleResponse toResponse(UserRole ur) {
        return UserRoleResponse.builder()
                .id(ur.getId())
                .userId(ur.getUser().getId())
                .roleId(ur.getRole().getId())
                .roleName(ur.getRole().getName())
                .roleDisplayName(ur.getRole().getDisplayName())
                .assignedBy(ur.getAssignedBy())
                .assignedAt(ur.getAssignedAt())
                .expiresAt(ur.getExpiresAt())
                .active(ur.isActive())
                .build();
    }
}
