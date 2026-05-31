package com.spa_management.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalCustomers;
    private BigDecimal monthlyRevenue;
    private long todayAppointments;
    // Add percentage changes if needed in the future
}
