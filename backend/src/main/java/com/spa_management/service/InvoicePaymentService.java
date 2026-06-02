package com.spa_management.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.request.PayInvoiceRequest;
import com.spa_management.dto.response.InvoiceResponse;
import com.spa_management.entity.Customer;
import com.spa_management.entity.Invoice;
import com.spa_management.entity.Payment;
import com.spa_management.entity.enums.PaymentStatus;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.mapper.SalonMapper;
import com.spa_management.repository.CustomerRepository;
import com.spa_management.repository.InvoiceRepository;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InvoicePaymentService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final SalonMapper salonMapper;

    @Transactional(readOnly = true)
    public List<InvoiceResponse> listMyInvoices() {
        Customer customer = customerRepository.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CUSTOMER_PROFILE_NOT_FOUND));

        return invoiceRepository.findByCustomerIdWithPayments(customer.getId()).stream()
                .map(salonMapper::toInvoiceResponse)
                .toList();
    }

    @Transactional
    public InvoiceResponse payInvoice(UUID invoiceId, PayInvoiceRequest request) {
        Customer customer = customerRepository.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CUSTOMER_PROFILE_NOT_FOUND));

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVOICE_NOT_FOUND));

        if (!invoice.getCustomer().getId().equals(customer.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Invoice is already paid.");
        }

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(invoice.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .transactionCode("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .paymentStatus(PaymentStatus.PAID)
                .paidAt(Instant.now())
                .build();
        invoice.getPayments().add(payment);
        invoice.setPaymentStatus(PaymentStatus.PAID);
        invoice = invoiceRepository.save(invoice);

        // Calculate and add loyalty points (1 point per 100,000 VND)
        if (invoice.getTotalAmount() != null && invoice.getTotalAmount().doubleValue() > 0) {
            int pointsEarned = (int) (invoice.getTotalAmount().doubleValue() / 100000.0);
            if (pointsEarned > 0) {
                int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;
                customer.setLoyaltyPoints(currentPoints + pointsEarned);
                customerRepository.save(customer);
            }
        }

        return salonMapper.toInvoiceResponse(invoice);
    }

    /**
     * Staff-assisted payment: allows employees (with INVOICE_PAY permission)
     * to process payment on behalf of a customer.
     */
    @Transactional
    public InvoiceResponse staffPayInvoice(UUID invoiceId, PayInvoiceRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVOICE_NOT_FOUND));

        if (invoice.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Invoice is already paid.");
        }

        Payment payment = invoice.getPayments().stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING)
                .findFirst()
                .orElseGet(() -> {
                    Payment newPayment = Payment.builder()
                            .invoice(invoice)
                            .amount(invoice.getTotalAmount())
                            .build();
                    invoice.getPayments().add(newPayment);
                    return newPayment;
                });
        
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionCode("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setPaymentStatus(PaymentStatus.PAID);
        payment.setPaidAt(Instant.now());
        invoice.setPaymentStatus(PaymentStatus.PAID);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // Calculate and add loyalty points (1 point per 100,000 VND)
        Customer customer = savedInvoice.getCustomer();
        if (savedInvoice.getTotalAmount() != null && savedInvoice.getTotalAmount().doubleValue() > 0) {
            int pointsEarned = (int) (savedInvoice.getTotalAmount().doubleValue() / 100000.0);
            if (pointsEarned > 0) {
                int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;
                customer.setLoyaltyPoints(currentPoints + pointsEarned);
                customerRepository.save(customer);
            }
        }

        return salonMapper.toInvoiceResponse(savedInvoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByAppointment(UUID appointmentId) {
        Invoice invoice = invoiceRepository.findByAppointmentIdWithPayments(appointmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVOICE_NOT_FOUND));
        return salonMapper.toInvoiceResponse(invoice);
    }
}
