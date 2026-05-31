package com.spa_management.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.response.BranchResponse;
import com.spa_management.dto.response.ServiceResponse;
import com.spa_management.dto.response.TechnicianResponse;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.mapper.SalonMapper;
import com.spa_management.repository.BranchRepository;
import com.spa_management.repository.EmployeeRepository;
import com.spa_management.repository.SalonServiceRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final SalonServiceRepository salonServiceRepository;
    private final BranchRepository branchRepository;
    private final EmployeeRepository employeeRepository;
    private final SalonMapper salonMapper;

    @Transactional(readOnly = true)
    @Cacheable("services")
    public List<ServiceResponse> listActiveServices() {
        return salonServiceRepository.findAllActiveWithCategory().stream()
                .map(salonMapper::toServiceResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceResponse getActiveService(UUID id) {
        return salonServiceRepository.findActiveByIdWithCategory(id)
                .map(salonMapper::toServiceResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    @Cacheable("branches")
    public List<BranchResponse> listBranches() {
        return branchRepository.findAll().stream()
                .map(salonMapper::toBranchResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "technicians", key = "#branchId != null ? #branchId : 'all'")
    public List<TechnicianResponse> listTechnicians(UUID branchId) {
        return employeeRepository.findTechniciansByBranch(branchId).stream()
                .map(salonMapper::toTechnicianResponse)
                .toList();
    }
}
