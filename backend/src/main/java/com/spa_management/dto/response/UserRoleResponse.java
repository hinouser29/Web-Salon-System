package com.spa_management.dto.response;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRoleResponse {

    private UUID id;
    private UUID userId;
    private UUID roleId;
    private String roleName;
    private String roleDisplayName;
    private UUID assignedBy;
    private Instant assignedAt;
    private Instant expiresAt;
    private boolean active;
}
