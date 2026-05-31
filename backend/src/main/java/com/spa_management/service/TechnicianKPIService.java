package com.spa_management.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.response.TechnicianKPIResponse;
import com.spa_management.entity.Appointment;
import com.spa_management.entity.Review;
import com.spa_management.entity.enums.AppointmentStatus;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.repository.AppointmentRepository;
import com.spa_management.repository.EmployeeRepository;
import com.spa_management.repository.ReviewRepository;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TechnicianKPIService {

    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public TechnicianKPIResponse getMyKPI() {
        UUID userId = SecurityUtils.getCurrentUserId();
        var employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "Not a technician"));

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        int completedToday = appointmentRepository.countCompletedByTechnicianOnDate(employee.getId(), today);
        int completedThisMonth = appointmentRepository.countCompletedByTechnicianBetweenDates(employee.getId(), startOfMonth, endOfMonth);

        List<Review> reviews = reviewRepository.findByEmployeeIdAndStatusApproved(employee.getId());
        double averageRating = 0.0;
        int totalReviews = reviews.size();

        if (totalReviews > 0) {
            double totalStars = reviews.stream().mapToInt(Review::getRating).sum();
            averageRating = totalStars / totalReviews;
            // Round to 1 decimal place
            averageRating = Math.round(averageRating * 10.0) / 10.0;
        }

        return TechnicianKPIResponse.builder()
                .completedToday(completedToday)
                .completedThisMonth(completedThisMonth)
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .build();
    }
}
