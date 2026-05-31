package com.spa_management.service;

import java.util.Map;
import com.spa_management.dto.request.SystemConfigRequest;

public interface AdminConfigService {
    Map<String, String> getAllConfigs();
    Map<String, String> updateConfigs(SystemConfigRequest request);
}
