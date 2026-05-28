package com.spa_management.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.spa_management.entity.User;
import com.spa_management.entity.UserRole;

import lombok.Getter;

@Getter
public class CustomUserDetails implements UserDetails {

    private final UUID id;
    private final String email;
    private final String password;
    private final boolean verified;
    private final boolean active;
    /** Version của permissions tại thời điểm load — dùng để so sánh với JWT */
    private final int permissionsVersion;
    private final Collection<? extends GrantedAuthority> authorities;

    /** Constructor đầy đủ — dùng khi load từ DB có RBAC */
    public CustomUserDetails(User user, List<UserRole> activeUserRoles) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.verified = user.isVerified();
        this.active = user.getStatus() == com.spa_management.entity.enums.UserStatus.ACTIVE;
        this.permissionsVersion = user.getPermissionsVersion();
        this.authorities = buildAuthorities(user, activeUserRoles);
    }

    /** Constructor backward-compat — fallback khi chưa có RBAC (dùng role enum cũ) */
    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPassword();
        this.verified = user.isVerified();
        this.active = user.getStatus() == com.spa_management.entity.enums.UserStatus.ACTIVE;
        this.permissionsVersion = user.getPermissionsVersion();
        // Fallback: dùng role enum cũ nếu không có RBAC data
        this.authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    /**
     * Xây dựng authorities từ RBAC:
     * - ROLE_ADMIN, ROLE_CUSTOMER, ... (từ roles)
     * - PERM_SERVICE_CREATE, PERM_APPOINTMENT_READ_OWN, ... (từ permissions)
     */
    private static List<GrantedAuthority> buildAuthorities(User user, List<UserRole> userRoles) {
        List<GrantedAuthority> authorities = new ArrayList<>();

        if (userRoles == null || userRoles.isEmpty()) {
            // Fallback sang role enum cũ
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            return authorities;
        }

        // Thêm tất cả ROLE_*
        userRoles.forEach(ur ->
                authorities.add(new SimpleGrantedAuthority("ROLE_" + ur.getRole().getName())));

        // Thêm tất cả PERM_* (deduplicated)
        userRoles.stream()
                .flatMap(ur -> ur.getRole().getRolePermissions().stream())
                .map(rp -> rp.getPermission().getCode())
                .distinct()
                .forEach(code -> authorities.add(new SimpleGrantedAuthority("PERM_" + code)));

        return authorities;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
