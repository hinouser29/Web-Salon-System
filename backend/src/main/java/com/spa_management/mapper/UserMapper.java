package com.spa_management.mapper;

import org.springframework.stereotype.Component;

import com.spa_management.dto.response.UserProfileResponse;
import com.spa_management.entity.User;

@Component
public class UserMapper {

    public UserProfileResponse toProfileResponse(User user, com.spa_management.entity.Customer customer) {
        if (user == null) {
            return null;
        }
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(customer != null ? customer.getAddress() : null)
                .birthday(customer != null ? customer.getBirthday() : null)
                .gender(customer != null && customer.getGender() != null ? com.spa_management.entity.enums.Gender.fromValue(customer.getGender()) : null)
                .avatarUrl(user.getAvatarUrl())
                .provider(user.getProvider())
                .role(user.getRole())
                .isVerified(user.isVerified())
                .isActive(user.getStatus() == com.spa_management.entity.enums.UserStatus.ACTIVE)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
