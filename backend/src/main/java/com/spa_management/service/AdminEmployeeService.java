package com.spa_management.service;

import java.util.List;
import java.util.UUID;

import com.spa_management.dto.request.EmployeeRequest;
import com.spa_management.dto.response.EmployeeResponse;

public interface AdminEmployeeService {
    List<EmployeeResponse> getAllEmployees();
    EmployeeResponse getEmployeeById(UUID id);
    EmployeeResponse createEmployee(EmployeeRequest request);
    EmployeeResponse updateEmployee(UUID id, EmployeeRequest request);
    void deleteEmployee(UUID id);
}
