package com.spa_management.dto.response;

import java.time.Instant;
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
public class AdminCustomerResponse {
    private UUID id;
    private UUID userId;
    private String email;
    private String fullName;
    private String phone;
    private String gender;
    private LocalDate birthday;
    private String address;
    private Integer loyaltyPoints;
    private Instant createdAt;
    private String status;
}
