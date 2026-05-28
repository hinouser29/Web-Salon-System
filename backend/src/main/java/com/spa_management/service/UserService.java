package com.spa_management.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.spa_management.dto.request.UpdateProfileRequest;
import com.spa_management.dto.response.UserProfileResponse;
import com.spa_management.entity.User;
import com.spa_management.entity.Customer;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.mapper.UserMapper;
import com.spa_management.repository.UserRepository;
import com.spa_management.repository.CustomerRepository;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final UserMapper userMapper;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentProfile() {
        User user = getCurrentUserEntity();
        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        return userMapper.toProfileResponse(user, customer);
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
        user = userRepository.save(user);

        Customer customer = customerRepository.findByUserId(user.getId()).orElse(null);
        if (customer != null) {
            if (request.getAddress() != null) {
                customer.setAddress(request.getAddress());
            }
            if (request.getBirthday() != null) {
                customer.setBirthday(request.getBirthday());
            }
            if (request.getGender() != null) {
                customer.setGender(request.getGender().name());
            }
            customer = customerRepository.save(customer);
        }

        return userMapper.toProfileResponse(user, customer);
    }

    @Transactional
    public UserProfileResponse updateAvatar(MultipartFile file) {
        User user = getCurrentUserEntity();
        String previousAvatar = user.getAvatarUrl();
        String newAvatarUrl = fileStorageService.storeAvatar(file, user.getId());
        user.setAvatarUrl(newAvatarUrl);
        User saved = userRepository.save(user);
        fileStorageService.deleteIfExists(previousAvatar);

        Customer customer = customerRepository.findByUserId(saved.getId()).orElse(null);
        return userMapper.toProfileResponse(saved, customer);
    }

    @Transactional(readOnly = true)
    public User getCurrentUserEntity() {
        UUID userId = SecurityUtils.getCurrentUserId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
