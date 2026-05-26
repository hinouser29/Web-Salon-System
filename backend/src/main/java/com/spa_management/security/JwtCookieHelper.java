package com.spa_management.security;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.spa_management.config.AppProperties;
import com.spa_management.dto.response.AuthResponse;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtCookieHelper {

    private final AppProperties appProperties;

    public void writeAuthCookies(HttpServletResponse response, AuthResponse auth) {
        AppProperties.Cookie cookieProps = appProperties.getCookie();
        addCookie(response, cookieProps.getAccessTokenName(), auth.getAccessToken(),
                cookieProps.getMaxAgeAccessSeconds());
        addCookie(response, cookieProps.getRefreshTokenName(), auth.getRefreshToken(),
                cookieProps.getMaxAgeRefreshSeconds());
    }

    public void clearAuthCookies(HttpServletResponse response) {
        AppProperties.Cookie cookieProps = appProperties.getCookie();
        addCookie(response, cookieProps.getAccessTokenName(), "", 0);
        addCookie(response, cookieProps.getRefreshTokenName(), "", 0);
    }

    public String resolveAccessToken(HttpServletRequest request) {
        String bearer = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return readCookie(request, appProperties.getCookie().getAccessTokenName());
    }

    public String resolveRefreshToken(HttpServletRequest request) {
        return readCookie(request, appProperties.getCookie().getRefreshTokenName());
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(appProperties.getCookie().isSecure())
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private String readCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
