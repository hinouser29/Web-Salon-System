package com.spa_management.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String password; // Optional if updating, required if creating

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;

    @NotBlank(message = "Role is required (STAFF, TECHNICIAN, RECEPTIONIST, etc.)")
    private String role;

    private UUID branchId;

    private String position;

    private String specialization;

    private BigDecimal salary;

    private BigDecimal commissionRate;
}
