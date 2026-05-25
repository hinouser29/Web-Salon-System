package com.spa_management.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.spa_management.dto.request.UpdateProfileRequest;
import com.spa_management.dto.response.UserProfileResponse;
import com.spa_management.entity.User;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.mapper.UserMapper;
import com.spa_management.repository.UserRepository;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentProfile() {
        return userMapper.toProfileResponse(getCurrentUserEntity());
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUserEntity();

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getBirthday() != null) {
            user.setBirthday(request.getBirthday());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        return userMapper.toProfileResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse updateAvatar(MultipartFile file) {
        User user = getCurrentUserEntity();
        String previousAvatar = user.getAvatarUrl();
        String newAvatarUrl = fileStorageService.storeAvatar(file, user.getId());
        user.setAvatarUrl(newAvatarUrl);
        User saved = userRepository.save(user);
        fileStorageService.deleteIfExists(previousAvatar);
        return userMapper.toProfileResponse(saved);
    }

    @Transactional(readOnly = true)
    public User getCurrentUserEntity() {
        Long userId = SecurityUtils.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
