package com.spa_management.dto.response;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private UUID id;
    private Integer rating;
    private String comment;
    private Instant createdAt;
    
    private String customerName;
    private String customerAvatar;
    
    private String serviceName;
    private String technicianName;
}
