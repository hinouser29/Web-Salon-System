package com.spa_management.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path avatarPath = Paths.get(appProperties.getUpload().getAvatarDir()).toAbsolutePath().normalize();
        String location = avatarPath.toUri().toString();
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations(location.endsWith("/") ? location : location + "/");
    }
}
