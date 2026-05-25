package com.spa_management.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private int verificationTokenExpirationHours = 24;
    private int passwordResetTokenExpirationHours = 1;
    private String frontendUrl = "http://localhost:3000";
    private OAuth2 oauth2 = new OAuth2();
    private Upload upload = new Upload();

    @Getter
    @Setter
    public static class Jwt {
        private String secret;
        private long accessTokenExpirationMs = 3_600_000L;
        private long refreshTokenExpirationMs = 604_800_000L;
    }

    @Getter
    @Setter
    public static class OAuth2 {
        private String redirectUri = "http://localhost:3000/oauth/callback";
    }

    @Getter
    @Setter
    public static class Upload {
        private String avatarDir = "uploads/avatars";
        private List<String> allowedContentTypes = List.of("image/jpeg", "image/png", "image/webp");
    }
}
