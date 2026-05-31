package com.spa_management.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.request.SystemConfigRequest;
import com.spa_management.entity.SystemConfig;
import com.spa_management.repository.SystemConfigRepository;
import com.spa_management.service.AdminConfigService;
import com.spa_management.service.SystemLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminConfigServiceImpl implements AdminConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private final SystemLogService systemLogService;

    @Override
    public Map<String, String> getAllConfigs() {
        List<SystemConfig> configs = systemConfigRepository.findAll();
        Map<String, String> configMap = new HashMap<>();
        
        // Add default values if table is empty
        if (configs.isEmpty()) {
            configMap.put("spa_name", "Glamour Spa");
            configMap.put("spa_phone", "0901234567");
            configMap.put("spa_email", "contact@glamourspa.com");
            configMap.put("loyalty_point_rate", "10000"); // 10,000 VND = 1 point
            configMap.put("open_time", "08:00");
            configMap.put("close_time", "20:00");
            return configMap;
        }

        return configs.stream()
                .collect(Collectors.toMap(SystemConfig::getConfigKey, SystemConfig::getConfigValue));
    }

    @Override
    @Transactional
    public Map<String, String> updateConfigs(SystemConfigRequest request) {
        if (request.getConfigs() == null) {
            return getAllConfigs();
        }

        request.getConfigs().forEach((key, value) -> {
            SystemConfig config = systemConfigRepository.findById(key)
                    .orElse(SystemConfig.builder().configKey(key).build());
            config.setConfigValue(value);
            systemConfigRepository.save(config);
        });
        
        systemLogService.logAction("UPDATE_CONFIG", "Cập nhật cấu hình hệ thống: " + request.getConfigs().keySet().toString());

        return getAllConfigs();
    }
}
