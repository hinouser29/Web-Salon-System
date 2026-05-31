package com.spa_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TechnicianKPIResponse {
    private int completedToday;
    private int completedThisMonth;
    private double averageRating;
    private int totalReviews;
}
