package com.spa_management.security;

import java.io.IOException;
import java.util.UUID;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.spa_management.entity.User;
import com.spa_management.entity.UserRole;
import com.spa_management.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final JwtCookieHelper jwtCookieHelper;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String token = resolveToken(request);
        if (token != null
                && SecurityContextHolder.getContext().getAuthentication() == null
                && jwtService.isTokenValid(token)
                && jwtService.isAccessToken(token)) {

            try {
                UUID userId = jwtService.getUserId(token);

                // Kiểm tra permissions_version: nếu lệch → reload fresh từ DB
                int jwtPermVer = jwtService.getPermissionsVersion(token);
                CustomUserDetails userDetails;

                if (jwtPermVer == -1) {
                    // Token cũ không có perm_ver → load bình thường
                    userDetails = userDetailsService.loadUserById(userId);
                } else {
                    // Kiểm tra version trong DB
                    User user = userRepository.findById(userId).orElse(null);
                    if (user == null) {
                        filterChain.doFilter(request, response);
                        return;
                    }

                    if (user.getPermissionsVersion() != jwtPermVer) {
                        // Quyền đã bị thay đổi → reload fresh authorities từ DB
                        log.debug("Permission version mismatch for user {}: jwt={}, db={}. Reloading authorities.",
                                userId, jwtPermVer, user.getPermissionsVersion());
                        var activeRoles = userDetailsService.loadActiveRolesByUserId(userId);
                        userDetails = new CustomUserDetails(user, activeRoles);
                    } else {
                        // Version khớp → load bình thường (nhanh, dùng user đã query)
                        userDetails = userDetailsService.loadUserByUser(user);
                    }
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ex) {
                log.debug("Failed to set authentication from JWT: {}", ex.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        return jwtCookieHelper.resolveAccessToken(request);
    }
}
