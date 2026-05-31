package com.spa_management.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.spa_management.dto.response.AdminCustomerResponse;
import com.spa_management.entity.Customer;
import com.spa_management.entity.User;
import com.spa_management.repository.CustomerRepository;
import com.spa_management.service.AdminCustomerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCustomerServiceImpl implements AdminCustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public List<AdminCustomerResponse> getAllCustomers() {
        return customerRepository.findAllWithUser().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AdminCustomerResponse mapToResponse(Customer customer) {
        User user = customer.getUser();
        return AdminCustomerResponse.builder()
                .id(customer.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .gender(customer.getGender())
                .birthday(customer.getBirthday())
                .address(customer.getAddress())
                .loyaltyPoints(customer.getLoyaltyPoints())
                .createdAt(customer.getCreatedAt())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .build();
    }
}
