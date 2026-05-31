package com.spa_management.service;

import java.io.IOException;
import java.util.UUID;
import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.spa_management.config.AppProperties;
import com.spa_management.config.SupabaseProperties;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final AppProperties appProperties;
    private final SupabaseProperties supabaseProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    public String storeAvatar(MultipartFile file, UUID userId) {
        validateAvatar(file);

        if (!StringUtils.hasText(supabaseProperties.getUrl())) {
            log.warn("Supabase URL is missing, cannot upload avatar to Cloud");
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "Cloud storage is not configured");
        }

        String extension = resolveExtension(file.getContentType());
        String filename = userId + "_" + UUID.randomUUID() + extension;
        
        String bucket = supabaseProperties.getStorage().getAvatarBucket();
        String uploadUrl = supabaseProperties.getUrl() + "/storage/v1/object/" + bucket + "/" + filename;
        
        String key = StringUtils.hasText(supabaseProperties.getServiceRoleKey()) 
            ? supabaseProperties.getServiceRoleKey() 
            : supabaseProperties.getAnonKey();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + key);
        headers.set("apikey", key);
        headers.set("Content-Type", file.getContentType());

        try {
            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
            ResponseEntity<Map> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                // Return public URL
                return supabaseProperties.getUrl() + "/storage/v1/object/public/" + bucket + "/" + filename;
            } else {
                log.error("Failed to upload to Supabase: {}", response.getBody());
                throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "Supabase storage rejected upload");
            }
        } catch (Exception ex) {
            log.error("Exception during avatar upload to Supabase", ex);
            throw new BusinessException(ErrorCode.FILE_UPLOAD_ERROR, "Failed to store avatar on cloud", ex);
        }
    }

    public void deleteIfExists(String avatarUrl) {
        if (!StringUtils.hasText(avatarUrl) || !avatarUrl.contains("/storage/v1/object/public/")) {
            return;
        }
        
        String bucket = supabaseProperties.getStorage().getAvatarBucket();
        String pathPrefix = supabaseProperties.getUrl() + "/storage/v1/object/public/" + bucket + "/";
        
        if (!avatarUrl.startsWith(pathPrefix)) return;
        
        String filename = avatarUrl.substring(pathPrefix.length());
        String deleteUrl = supabaseProperties.getUrl() + "/storage/v1/object/" + bucket + "/" + filename;
        
        String key = StringUtils.hasText(supabaseProperties.getServiceRoleKey()) 
            ? supabaseProperties.getServiceRoleKey() 
            : supabaseProperties.getAnonKey();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + key);
        headers.set("apikey", key);
        
        try {
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, requestEntity, Void.class);
            log.info("Deleted avatar from Supabase: {}", filename);
        } catch (Exception ex) {
            log.warn("Failed to delete avatar from Supabase (best-effort): {}", ex.getMessage());
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
