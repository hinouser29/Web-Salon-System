package com.spa_management.service;

import java.util.List;
import java.util.Map;

public interface AdminReportService {
    Map<String, Object> getRevenueReport(String timeframe); // timeframe: week, month, year
    List<Map<String, Object>> getTopServices(int limit);
}
