package com.spa_management.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;

import com.spa_management.dto.response.DashboardStatsResponse;
import com.spa_management.entity.Invoice;
import com.spa_management.entity.enums.PaymentStatus;
import com.spa_management.repository.AppointmentRepository;
import com.spa_management.repository.CustomerRepository;
import com.spa_management.repository.InvoiceRepository;
import com.spa_management.service.AdminDashboardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        long totalCustomers = customerRepository.count();

        // Calculate revenue for current month
        ZonedDateTime now = ZonedDateTime.now(ZoneId.systemDefault());
        Instant startOfMonth = now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS).toInstant();
        Instant endOfMonth = now.plusMonths(1).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS).toInstant();

        BigDecimal monthlyRevenue = invoiceRepository.sumPaidRevenueBetween(startOfMonth, endOfMonth);
        if (monthlyRevenue == null) monthlyRevenue = BigDecimal.ZERO;

        // Calculate today's appointments
        java.time.LocalDate today = java.time.LocalDate.now(ZoneId.systemDefault());
        long todayAppointments = appointmentRepository.countByAppointmentDate(today);

        return DashboardStatsResponse.builder()
                .totalCustomers(totalCustomers)
                .monthlyRevenue(monthlyRevenue)
                .todayAppointments(todayAppointments)
                .build();
    }
}
