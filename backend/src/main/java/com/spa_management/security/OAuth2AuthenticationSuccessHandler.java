package com.spa_management.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import com.spa_management.config.AppProperties;
import com.spa_management.dto.response.AuthResponse;
import com.spa_management.entity.User;
import com.spa_management.repository.UserRepository;
import com.spa_management.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final AppProperties appProperties;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IOException("OAuth user not found after authentication"));

        AuthResponse tokens = authService.buildAuthResponse(user);

        String redirectUrl = UriComponentsBuilder.fromUriString(appProperties.getOauth2().getRedirectUri())
                .queryParam("accessToken", tokens.getAccessToken())
                .queryParam("refreshToken", tokens.getRefreshToken())
                .queryParam("tokenType", tokens.getTokenType())
                .queryParam("expiresIn", tokens.getExpiresIn())
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
