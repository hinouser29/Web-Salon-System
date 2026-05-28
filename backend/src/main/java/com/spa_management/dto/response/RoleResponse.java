package com.spa_management.dto.response;

import java.time.Instant;
import java.util.List;
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
public class RoleResponse {

    private UUID id;
    private String name;
    private String displayName;
    private String description;
    private boolean system;
    private Instant createdAt;

    /** Populated when fetching role details */
    private List<PermissionResponse> permissions;
}
