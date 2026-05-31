package com.spa_management.service;

import java.util.List;

import com.spa_management.dto.response.AdminCustomerResponse;

public interface AdminCustomerService {
    List<AdminCustomerResponse> getAllCustomers();
}
