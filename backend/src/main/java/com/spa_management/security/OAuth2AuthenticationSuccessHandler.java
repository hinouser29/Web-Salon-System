package com.spa_management.security;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
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
    private final JwtCookieHelper jwtCookieHelper;

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
        jwtCookieHelper.writeAuthCookies(response, tokens);

        String frontendBase = appProperties.getFrontendUrl().replaceAll("/$", "");
        String fragment = "accessToken=" + URLEncoder.encode(tokens.getAccessToken(), StandardCharsets.UTF_8)
                + "&refreshToken=" + URLEncoder.encode(tokens.getRefreshToken(), StandardCharsets.UTF_8)
                + "&tokenType=" + URLEncoder.encode(tokens.getTokenType(), StandardCharsets.UTF_8);
        String redirectUrl = frontendBase + "/oauth/callback#" + fragment;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
