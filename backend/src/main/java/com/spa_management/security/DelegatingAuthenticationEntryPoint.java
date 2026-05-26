package com.spa_management.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DelegatingAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException {

        String uri = request.getRequestURI();
        if (uri.startsWith("/api/")) {
            restAuthenticationEntryPoint.commence(request, response, authException);
            return;
        }

        String redirect = "/login";
        if (uri != null && !uri.isBlank() && !"/login".equals(uri)) {
            redirect += "?redirect=" + java.net.URLEncoder.encode(uri, java.nio.charset.StandardCharsets.UTF_8);
        }
        response.sendRedirect(redirect);
    }
}
