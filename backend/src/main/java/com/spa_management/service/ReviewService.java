package com.spa_management.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.request.CreateReviewRequest;
import com.spa_management.dto.response.ReviewResponse;
import com.spa_management.dto.response.ReviewSummaryResponse;
import com.spa_management.entity.Appointment;
import com.spa_management.entity.AppointmentServiceLine;
import com.spa_management.entity.Customer;
import com.spa_management.entity.Review;
import com.spa_management.entity.enums.AppointmentStatus;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.repository.AppointmentRepository;
import com.spa_management.repository.CustomerRepository;
import com.spa_management.repository.ReviewRepository;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CUSTOMER_PROFILE_NOT_FOUND));

        Appointment appointment = appointmentRepository.findByIdWithDetails(request.getAppointmentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.APPOINTMENT_NOT_FOUND));

        if (!appointment.getCustomer().getId().equals(customer.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Chi co the danh gia lich hen da hoan thanh.");
        }

        if (reviewRepository.existsByAppointmentId(appointment.getId())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Ban da danh gia lich hen nay roi.");
        }

        AppointmentServiceLine line = appointment.getServiceLines().isEmpty() ? null : appointment.getServiceLines().get(0);
        if (line == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Lich hen khong co dich vu.");
        }

        Review review = Review.builder()
                .appointment(appointment)
                .customer(customer)
                .employee(line.getTechnician())
                .service(line.getService())
                .rating(request.getRating())
                .comment(request.getComment())
                .status("APPROVED") // Auto-approve cho phien ban hien tai
                .build();

        review = reviewRepository.save(review);
        return mapToResponse(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByService(UUID serviceId) {
        return reviewRepository.findByServiceIdAndStatusApproved(serviceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReviewSummaryResponse getReviewSummaryByService(UUID serviceId) {
        List<Review> reviews = reviewRepository.findByServiceIdAndStatusApproved(serviceId);
        return calculateSummary(reviews);
    }

    private ReviewSummaryResponse calculateSummary(List<Review> reviews) {
        if (reviews.isEmpty()) {
            return new ReviewSummaryResponse(0.0, 0, 0, 0, 0, 0, 0);
        }

        long total = reviews.size();
        long five = reviews.stream().filter(r -> r.getRating() == 5).count();
        long four = reviews.stream().filter(r -> r.getRating() == 4).count();
        long three = reviews.stream().filter(r -> r.getRating() == 3).count();
        long two = reviews.stream().filter(r -> r.getRating() == 2).count();
        long one = reviews.stream().filter(r -> r.getRating() == 1).count();
        
        double avg = (five * 5 + four * 4 + three * 3 + two * 2 + one * 1) / (double) total;

        return ReviewSummaryResponse.builder()
                .averageRating(Math.round(avg * 10.0) / 10.0)
                .totalReviews(total)
                .fiveStarCount(five)
                .fourStarCount(four)
                .threeStarCount(three)
                .twoStarCount(two)
                .oneStarCount(one)
                .build();
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .customerName(review.getCustomer().getUser().getFullName())
                .customerAvatar(review.getCustomer().getUser().getAvatarUrl())
                .serviceName(review.getService().getName())
                .technicianName(review.getEmployee() != null ? review.getEmployee().getUser().getFullName() : null)
                .build();
    }
}
