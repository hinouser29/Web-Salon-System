package com.spa_management.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.response.SystemLogResponse;
import com.spa_management.entity.SystemLog;
import com.spa_management.entity.User;
import com.spa_management.repository.SystemLogRepository;
import com.spa_management.repository.UserRepository;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SystemLogService {

    private final SystemLogRepository systemLogRepository;
    private final UserRepository userRepository;

    @Async
    @Transactional
    public void logAction(String action, String description) {
        try {
            User currentUser = null;
            if (SecurityUtils.getCurrentUserId() != null) {
                currentUser = userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null);
            }

            SystemLog log = SystemLog.builder()
                    .user(currentUser)
                    .action(action)
                    .description(description)
                    .build();

            systemLogRepository.save(log);
        } catch (Exception e) {
            // Do not break the main transaction if logging fails
            e.printStackTrace();
        }
    }

    @Transactional(readOnly = true)
    public Page<SystemLogResponse> getSystemLogs(Pageable pageable) {
        return systemLogRepository.findAllWithUser(pageable)
                .map(SystemLogResponse::fromEntity);
    }
}
