package com.spa_management.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.request.CreateReviewRequest;
import com.spa_management.dto.response.ReviewResponse;
import com.spa_management.dto.response.ReviewSummaryResponse;
import com.spa_management.service.ReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasAuthority('PERM_REVIEW_CREATE') or hasAuthority('ROLE_CUSTOMER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(reviewService.createReview(request)));
    }

    @GetMapping("/services/{serviceId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByService(@PathVariable UUID serviceId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewsByService(serviceId)));
    }

    @GetMapping("/services/{serviceId}/summary")
    public ResponseEntity<ApiResponse<ReviewSummaryResponse>> getReviewSummaryByService(@PathVariable UUID serviceId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewSummaryByService(serviceId)));
    }
}
