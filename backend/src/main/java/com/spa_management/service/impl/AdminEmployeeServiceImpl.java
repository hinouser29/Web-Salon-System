package com.spa_management.service.impl;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.spa_management.dto.request.EmployeeRequest;
import com.spa_management.dto.response.EmployeeResponse;
import com.spa_management.entity.Employee;
import com.spa_management.entity.User;
import com.spa_management.entity.UserRole;
import com.spa_management.entity.enums.AuthProvider;
import com.spa_management.entity.enums.Role;
import com.spa_management.entity.enums.UserStatus;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.repository.EmployeeRepository;
import com.spa_management.repository.RoleRepository;
import com.spa_management.repository.UserRepository;
import com.spa_management.repository.UserRoleRepository;
import com.spa_management.service.AdminEmployeeService;
import com.spa_management.service.SystemLogService;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminEmployeeServiceImpl implements AdminEmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordEncoder passwordEncoder;
    private final SystemLogService systemLogService;

    private void checkManagerConstraints(String targetRole) {
        if (targetRole != null && SecurityUtils.hasAuthority("ROLE_MANAGER") && 
            !SecurityUtils.hasAuthority("ROLE_ADMIN") && 
            !SecurityUtils.hasAuthority("ROLE_SUPER_ADMIN")) {
            
            if (targetRole.equalsIgnoreCase("ADMIN") || 
                targetRole.equalsIgnoreCase("SUPER_ADMIN") || 
                targetRole.equalsIgnoreCase("MANAGER")) {
                throw new BusinessException(ErrorCode.FORBIDDEN, "Quản lý không có quyền tác động đến các chức danh Quản lý/Admin");
            }
        }
    }

    @Override
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeResponse getEmployeeById(UUID id) {
        return employeeRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Employee not found"));
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        checkManagerConstraints(request.getRole());

        if (!StringUtils.hasText(request.getPassword())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Password is required for new employees");
        }

        Role userRoleEnum;
        try {
            userRoleEnum = Role.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid role");
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .provider(AuthProvider.LOCAL)
                .role(userRoleEnum)
                .verified(true) // Admin creates verified account
                .status(UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);

        // Assign RBAC Role
        com.spa_management.entity.Role dbRole = roleRepository.findByName(userRoleEnum.name())
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND, "Role not found in DB"));

        UserRole userRole = UserRole.builder()
                .user(user)
                .role(dbRole)
                .build();
        userRoleRepository.save(userRole);

        Employee employee = Employee.builder()
                .user(user)
                .branchId(request.getBranchId())
                .position(request.getPosition())
                .specialization(request.getSpecialization())
                .salary(request.getSalary())
                .commissionRate(request.getCommissionRate())
                .hireDate(LocalDate.now())
                .build();

        Employee saved = employeeRepository.save(employee);
        systemLogService.logAction("CREATE_EMPLOYEE", "Tạo mới nhân viên: " + request.getEmail() + " (" + request.getRole() + ")");
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(UUID id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Employee not found"));

        User user = employee.getUser();
        checkManagerConstraints(user.getRole().name()); // Check existing role
        checkManagerConstraints(request.getRole()); // Check requested role

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        
        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // Update Role if changed
        try {
            Role newRoleEnum = Role.valueOf(request.getRole().toUpperCase());
            if (user.getRole() != newRoleEnum) {
                user.setRole(newRoleEnum);
                
                userRoleRepository.deleteByUserId(user.getId());
                
                com.spa_management.entity.Role dbRole = roleRepository.findByName(newRoleEnum.name())
                        .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND, "Role not found in DB"));

                UserRole userRole = UserRole.builder()
                        .user(user)
                        .role(dbRole)
                        .build();
                userRoleRepository.save(userRole);
            }
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid role");
        }

        userRepository.save(user);

        employee.setBranchId(request.getBranchId());
        employee.setPosition(request.getPosition());
        employee.setSpecialization(request.getSpecialization());
        employee.setSalary(request.getSalary());
        employee.setCommissionRate(request.getCommissionRate());

        Employee saved = employeeRepository.save(employee);
        systemLogService.logAction("UPDATE_EMPLOYEE", "Cập nhật nhân viên: " + user.getEmail());
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public void deleteEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Employee not found"));
        
        User user = employee.getUser();
        checkManagerConstraints(user.getRole().name());

        user.setStatus(UserStatus.INACTIVE); // Soft delete / disable account
        userRepository.save(user);
        systemLogService.logAction("DISABLE_EMPLOYEE", "Vô hiệu hóa tài khoản nhân viên: " + user.getEmail());
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        User user = employee.getUser();
        return EmployeeResponse.builder()
                .id(employee.getId())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .branchId(employee.getBranchId())
                .position(employee.getPosition())
                .specialization(employee.getSpecialization())
                .salary(employee.getSalary())
                .commissionRate(employee.getCommissionRate())
                .hireDate(employee.getHireDate())
                .build();
    }
}
