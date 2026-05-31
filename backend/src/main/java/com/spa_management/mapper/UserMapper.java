package com.spa_management.mapper;

import org.springframework.stereotype.Component;

import com.spa_management.dto.response.UserProfileResponse;
import com.spa_management.entity.User;
import com.spa_management.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final UserRoleRepository userRoleRepository;

    public UserProfileResponse toProfileResponse(User user, com.spa_management.entity.Customer customer) {
        if (user == null) {
            return null;
        }
        
        int points = customer != null && customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;
        String tier = "Dong";
        if (points >= 5000) tier = "Vang";
        else if (points >= 2000) tier = "Bac";
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
                .loyaltyPoints(points)
                .loyaltyTier(tier)
                .permissions(userRoleRepository.findActiveByUserId(user.getId()).stream()
                        .flatMap(ur -> ur.getRole().getRolePermissions().stream())
                        .map(rp -> rp.getPermission().getCode())
                        .distinct()
                        .toList())
                .build();
    }
}
