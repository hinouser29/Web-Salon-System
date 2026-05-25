package com.spa_management.security;

import java.util.Map;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OAuth2UserInfo {

    private final String id;
    private final String email;
    private final String name;
    private final String picture;

    public static OAuth2UserInfo fromGoogleAttributes(Map<String, Object> attributes) {
        return OAuth2UserInfo.builder()
                .id(String.valueOf(attributes.get("sub")))
                .email((String) attributes.get("email"))
                .name((String) attributes.get("name"))
                .picture((String) attributes.get("picture"))
                .build();
    }
}
