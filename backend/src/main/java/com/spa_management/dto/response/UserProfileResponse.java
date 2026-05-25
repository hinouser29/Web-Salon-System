package com.spa_management.dto.response;

import java.time.Instant;
import java.time.LocalDate;

import com.spa_management.entity.enums.AuthProvider;
import com.spa_management.entity.enums.Gender;
import com.spa_management.entity.enums.Role;

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
public class UserProfileResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate birthday;
    private Gender gender;
    private String avatarUrl;
    private AuthProvider provider;
    private Role role;
    private boolean isVerified;
    private boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
