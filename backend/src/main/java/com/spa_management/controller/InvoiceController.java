package com.spa_management.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spa_management.dto.request.PayInvoiceRequest;
import com.spa_management.dto.response.ApiResponse;
import com.spa_management.dto.response.InvoiceResponse;
import com.spa_management.service.InvoicePaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Invoice and payment APIs")
@SecurityRequirement(name = "bearerAuth")
public class InvoiceController {

    private final InvoicePaymentService invoicePaymentService;

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('PERM_INVOICE_READ_OWN') or hasAnyRole('CUSTOMER', 'USER')")
    @Operation(summary = "List current customer's invoices")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> listMine() {
        return ResponseEntity.ok(ApiResponse.success(invoicePaymentService.listMyInvoices()));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAuthority('PERM_INVOICE_READ_OWN') or hasAnyRole('CUSTOMER', 'USER')")
    @Operation(summary = "Pay an invoice (customer self-pay)")
    public ResponseEntity<ApiResponse<InvoiceResponse>> pay(
            @PathVariable UUID id,
            @Valid @RequestBody PayInvoiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Payment successful",
                invoicePaymentService.payInvoice(id, request)));
    }

    @PostMapping("/{id}/staff-pay")
    @PreAuthorize("hasAuthority('PERM_INVOICE_PAY')")
    @Operation(summary = "Staff-assisted payment on behalf of customer")
    public ResponseEntity<ApiResponse<InvoiceResponse>> staffPay(
            @PathVariable UUID id,
            @Valid @RequestBody PayInvoiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                "Staff payment processed successfully",
                invoicePaymentService.staffPayInvoice(id, request)));
    }

    @GetMapping("/by-appointment/{appointmentId}")
    @PreAuthorize("hasAuthority('PERM_INVOICE_PAY') or hasAuthority('PERM_APPOINTMENT_UPDATE_ALL')")
    @Operation(summary = "Get invoice for a specific appointment")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getByAppointment(
            @PathVariable UUID appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(
                invoicePaymentService.getInvoiceByAppointment(appointmentId)));
    }
}
