package com.spa_management.security;

import java.util.UUID;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.entity.User;
import com.spa_management.entity.UserRole;
import com.spa_management.repository.UserRepository;
import com.spa_management.repository.UserRoleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return buildUserDetails(user);
    }

    @Transactional(readOnly = true)
    public CustomUserDetails loadUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));
        return buildUserDetails(user);
    }

    @Transactional(readOnly = true)
    public CustomUserDetails loadUserByUser(User user) {
        return buildUserDetails(user);
    }

    /** Xây dựng CustomUserDetails với đầy đủ ROLE_* và PERM_* */
    private CustomUserDetails buildUserDetails(User user) {
        // Load active roles kèm permissions (fetch join — tránh N+1)
        var activeUserRoles = userRoleRepository.findActiveByUserId(user.getId());
        return new CustomUserDetails(user, activeUserRoles);
    }

    /**
     * Load fresh authorities từ DB (dùng khi perm_ver không khớp JWT).
     * Trả về danh sách UserRole còn hiệu lực.
     */
    @Transactional(readOnly = true)
    public java.util.List<UserRole> loadActiveRolesByUserId(UUID userId) {
        return userRoleRepository.findActiveByUserId(userId);
    }
}
