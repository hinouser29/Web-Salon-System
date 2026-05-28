package com.spa_management.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.spa_management.entity.Permission;

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
public class PermissionResponse {

    private UUID id;
    private String code;
    private String resource;
    private String action;
    private String description;
    private Instant createdAt;

    public static PermissionResponse from(Permission entity) {
        return PermissionResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .resource(entity.getResource())
                .action(entity.getAction())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
