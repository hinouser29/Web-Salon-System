package com.spa_management.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private UUID id;
    private UUID userId;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String status;
    private UUID branchId;
    private String position;
    private String specialization;
    private BigDecimal salary;
    private BigDecimal commissionRate;
    private LocalDate hireDate;
}
