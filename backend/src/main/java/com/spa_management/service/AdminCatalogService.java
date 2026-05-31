package com.spa_management.service;

import java.util.List;
import java.util.UUID;

import com.spa_management.dto.request.SalonServiceRequest;
import com.spa_management.dto.response.ServiceResponse;

public interface AdminCatalogService {
    List<ServiceResponse> getAllServices();
    ServiceResponse createService(SalonServiceRequest request);
    ServiceResponse updateService(UUID id, SalonServiceRequest request);
    void deleteService(UUID id);
}
