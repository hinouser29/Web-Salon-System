package com.spa_management.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.spa_management.entity.Invoice;
import com.spa_management.entity.enums.PaymentStatus;
import com.spa_management.repository.AppointmentRepository;
import com.spa_management.repository.InvoiceRepository;
import com.spa_management.repository.SalonServiceRepository;
import com.spa_management.service.AdminReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminReportServiceImpl implements AdminReportService {

    private final InvoiceRepository invoiceRepository;
    private final AppointmentRepository appointmentRepository;
    private final SalonServiceRepository salonServiceRepository;

    @Override
    public Map<String, Object> getRevenueReport(String timeframe) {
        ZonedDateTime now = ZonedDateTime.now(ZoneId.systemDefault());
        Instant startDate;
        
        List<String> labels = new ArrayList<>();
        List<BigDecimal> data = new ArrayList<>();

        // Generate dummy trend data for now based on timeframe
        if ("week".equalsIgnoreCase(timeframe)) {
            startDate = now.minusDays(7).toInstant();
            for (int i = 6; i >= 0; i--) {
                labels.add(now.minusDays(i).toLocalDate().toString());
                data.add(new BigDecimal((long)(Math.random() * 5000000 + 1000000)));
            }
        } else if ("year".equalsIgnoreCase(timeframe)) {
            startDate = now.minusMonths(12).toInstant();
            for (int i = 11; i >= 0; i--) {
                labels.add("Tháng " + now.minusMonths(i).getMonthValue());
                data.add(new BigDecimal((long)(Math.random() * 50000000 + 10000000)));
            }
        } else { // default month
            startDate = now.minusDays(30).toInstant();
            for (int i = 4; i >= 0; i--) { // Group by weeks for simplicity
                labels.add("Tuần " + (5 - i));
                data.add(new BigDecimal((long)(Math.random() * 20000000 + 5000000)));
            }
        }

        // Get actual total revenue in period
        BigDecimal totalRevenue = invoiceRepository.sumPaidRevenueSince(startDate);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        Map<String, Object> result = new HashMap<>();
        result.put("labels", labels);
        result.put("data", data);
        result.put("totalRevenue", totalRevenue);
        return result;
    }

    @Override
    public List<Map<String, Object>> getTopServices(int limit) {
        // Return dummy data for top services
        List<Map<String, Object>> topServices = new ArrayList<>();
        
        Map<String, Object> s1 = new HashMap<>();
        s1.put("name", "Chăm sóc da mặt chuyên sâu");
        s1.put("bookings", 145);
        s1.put("revenue", 72500000);
        
        Map<String, Object> s2 = new HashMap<>();
        s2.put("name", "Massage toàn thân đá nóng");
        s2.put("bookings", 98);
        s2.put("revenue", 78400000);
        
        Map<String, Object> s3 = new HashMap<>();
        s3.put("name", "Gội đầu dưỡng sinh");
        s3.put("bookings", 250);
        s3.put("revenue", 50000000);
        
        topServices.add(s1);
        topServices.add(s2);
        topServices.add(s3);
        
        return topServices;
    }
}
