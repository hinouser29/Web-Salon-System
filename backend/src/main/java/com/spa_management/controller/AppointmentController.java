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

import com.spa_management.dto.request.CreateAppointmentRequest;
import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.AppointmentResponse;
import com.spa_management.service.AppointmentBookingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Booking and appointment management")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentBookingService appointmentBookingService;

    @PostMapping
    @PreAuthorize("hasAuthority('PERM_APPOINTMENT_CREATE') or hasAnyRole('CUSTOMER', 'USER')")
    @Operation(summary = "Create a new appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> create(
            @Valid @RequestBody CreateAppointmentRequest request) {
        AppointmentResponse response = appointmentBookingService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment created", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('PERM_APPOINTMENT_READ_OWN') or hasAnyRole('CUSTOMER', 'USER')")
    @Operation(summary = "List current customer's appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> listMine() {
        return ResponseEntity.ok(ApiResponse.success(appointmentBookingService.listMyAppointments()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_APPOINTMENT_READ_ALL') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF', 'SUPPORT')")
    @Operation(summary = "List all appointments (staff)")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(appointmentBookingService.listAllAppointments()));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('PERM_APPOINTMENT_UPDATE_OWN') or hasAuthority('PERM_APPOINTMENT_UPDATE_ALL') or hasAnyRole('CUSTOMER', 'USER')")
    @Operation(summary = "Cancel an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Appointment cancelled",
                appointmentBookingService.cancelAppointment(id)));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAuthority('PERM_APPOINTMENT_UPDATE_ALL') or hasAnyRole('ADMIN', 'SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST', 'STAFF', 'SUPPORT')")
    @Operation(summary = "Confirm a pending appointment (staff)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> confirm(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Appointment confirmed",
                appointmentBookingService.confirmAppointment(id)));
    }
}
