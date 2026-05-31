package com.spa_management.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.request.SalonServiceRequest;
import com.spa_management.dto.response.ServiceResponse;
import com.spa_management.entity.SalonService;
import com.spa_management.entity.ServiceCategory;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.repository.ServiceCategoryRepository;
import com.spa_management.repository.SalonServiceRepository;
import com.spa_management.service.AdminCatalogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCatalogServiceImpl implements AdminCatalogService {

    private final SalonServiceRepository serviceRepository;
    private final ServiceCategoryRepository categoryRepository;

    @Override
    public List<ServiceResponse> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceResponse createService(SalonServiceRequest request) {
        ServiceCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Category not found"));
        }

        SalonService service = SalonService.builder()
                .name(request.getName())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .active(request.getActive() != null ? request.getActive() : true)
                .category(category)
                .build();

        return mapToResponse(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public ServiceResponse updateService(UUID id, SalonServiceRequest request) {
        SalonService service = serviceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND, "Service not found"));

        if (request.getCategoryId() != null) {
            ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND, "Category not found"));
            service.setCategory(category);
        }

        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setPrice(request.getPrice());
        service.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }

        return mapToResponse(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public void deleteService(UUID id) {
        SalonService service = serviceRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND, "Service not found"));
        
        // Soft delete or hard delete? Let's do soft delete for services
        service.setActive(false);
        serviceRepository.save(service);
    }

    private ServiceResponse mapToResponse(SalonService service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .durationMinutes(service.getDurationMinutes())
                .price(service.getPrice())
                .imageUrl(service.getImageUrl())
                .categoryName(service.getCategory() != null ? service.getCategory().getName() : null)
                .active(service.isActive())
                .build();
    }
}
