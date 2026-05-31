package com.spa_management.dto.response;

import java.time.Instant;
import java.util.UUID;

import com.spa_management.entity.SystemLog;

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
public class SystemLogResponse {

    private UUID id;
    private String userEmail;
    private String userFullName;
    private String action;
    private String description;
    private Instant createdAt;

    public static SystemLogResponse fromEntity(SystemLog log) {
        return SystemLogResponse.builder()
                .id(log.getId())
                .userEmail(log.getUser() != null ? log.getUser().getEmail() : "SYSTEM")
                .userFullName(log.getUser() != null ? log.getUser().getFullName() : "System")
                .action(log.getAction())
                .description(log.getDescription())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
