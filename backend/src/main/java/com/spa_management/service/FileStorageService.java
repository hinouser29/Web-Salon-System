package com.spa_management.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.spa_management.config.AppProperties;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final AppProperties appProperties;
    private Path avatarStoragePath;

    @PostConstruct
    void init() throws IOException {
        avatarStoragePath = Paths.get(appProperties.getUpload().getAvatarDir())
                .toAbsolutePath()
                .normalize();
        Files.createDirectories(avatarStoragePath);
    }

    public String storeAvatar(MultipartFile file, Long userId) {
        validateAvatar(file);

        String extension = resolveExtension(file.getContentType());
        String filename = userId + "_" + UUID.randomUUID() + extension;
        Path target = avatarStoragePath.resolve(filename);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/avatars/" + filename;
        } catch (IOException ex) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "Failed to store avatar", ex);
        }
    }

    public void deleteIfExists(String avatarUrl) {
        if (!StringUtils.hasText(avatarUrl) || !avatarUrl.startsWith("/uploads/avatars/")) {
            return;
        }
        String filename = avatarUrl.substring("/uploads/avatars/".length());
        Path filePath = avatarStoragePath.resolve(filename).normalize();
        if (!filePath.startsWith(avatarStoragePath)) {
            return;
        }
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // best-effort cleanup
        }
    }

    private void validateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "Avatar file is required");
        }
        String contentType = file.getContentType();
        if (contentType == null
                || !appProperties.getUpload().getAllowedContentTypes().contains(contentType)) {
            throw new BusinessException(ErrorCode.INVALID_FILE_TYPE);
        }
    }

    private String resolveExtension(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}
