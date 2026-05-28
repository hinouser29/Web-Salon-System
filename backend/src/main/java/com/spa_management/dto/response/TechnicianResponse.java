package com.spa_management.dto.response;

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
public class TechnicianResponse {

    private UUID id;
    private String fullName;
    private String position;
    private String specialization;
    private UUID branchId;
}
