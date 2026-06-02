package com.spa_management.service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.dto.request.CreateAppointmentRequest;
import com.spa_management.dto.response.AppointmentResponse;
import com.spa_management.entity.Appointment;
import com.spa_management.entity.AppointmentServiceLine;
import com.spa_management.entity.Branch;
import com.spa_management.entity.Customer;
import com.spa_management.entity.Employee;
import com.spa_management.entity.Invoice;
import com.spa_management.entity.Payment;
import com.spa_management.entity.SalonService;
import com.spa_management.entity.User;
import com.spa_management.entity.enums.AppointmentStatus;
import com.spa_management.entity.enums.PaymentStatus;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.mapper.SalonMapper;
import com.spa_management.repository.AppointmentRepository;
import com.spa_management.repository.BranchRepository;
import com.spa_management.repository.CustomerRepository;
import com.spa_management.repository.EmployeeRepository;
import com.spa_management.repository.InvoiceRepository;
import com.spa_management.repository.SalonServiceRepository;
import com.spa_management.repository.UserRepository;
import com.spa_management.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentBookingService {

    private final AppointmentRepository appointmentRepository;
    private final SalonServiceRepository salonServiceRepository;
    private final BranchRepository branchRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;
    private final SalonMapper salonMapper;
    private final EmailService emailService;

    @Transactional
    public AppointmentResponse createAppointment(CreateAppointmentRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CUSTOMER_PROFILE_NOT_FOUND));

        SalonService service = salonServiceRepository.findActiveByIdWithCategory(request.getServiceId())
                .orElseThrow(() -> new BusinessException(ErrorCode.SERVICE_NOT_FOUND));

        Branch branch = resolveBranch(request.getBranchId());
        Employee technician = resolveTechnician(request.getTechnicianId(), branch.getId());

        LocalTime endTime = request.getStartTime().plusMinutes(service.getDurationMinutes());
        validateWithinBranchHours(branch, request.getStartTime(), endTime);

        if (technician != null && appointmentRepository.existsTechnicianOverlap(
                technician.getId(),
                request.getAppointmentDate(),
                request.getStartTime(),
                endTime,
                null)) {
            throw new BusinessException(ErrorCode.APPOINTMENT_SLOT_UNAVAILABLE,
                    "Technician is not available at the selected time.");
        }

        User bookedBy = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Appointment appointment = Appointment.builder()
                .customer(customer)
                .branch(branch)
                .bookedBy(bookedBy)
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .status(AppointmentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        AppointmentServiceLine line = AppointmentServiceLine.builder()
                .appointment(appointment)
                .service(service)
                .technician(technician)
                .price(service.getPrice())
                .status("PENDING")
                .build();
        appointment.getServiceLines().add(line);

        appointment = appointmentRepository.save(appointment);
        createInvoiceForAppointment(appointment, service.getPrice(), request.getPaymentMethod());

        try {
            emailService.sendAppointmentConfirmation(
                    bookedBy.getEmail(),
                    customer.getUser().getFullName(),
                    service.getName(),
                    request.getAppointmentDate().toString(),
                    request.getStartTime().toString()
            );
        } catch (Exception e) {
            // Ignore email errors to avoid failing the booking
        }

        return salonMapper.toAppointmentResponse(
                appointmentRepository.findByIdWithDetails(appointment.getId()).orElse(appointment));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listMyAppointments() {
        Customer customer = getCurrentCustomer();
        return appointmentRepository.findByCustomerIdWithDetails(customer.getId()).stream()
                .map(salonMapper::toAppointmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listAllAppointments() {
        return appointmentRepository.findAllWithDetails().stream()
                .map(salonMapper::toAppointmentResponse)
                .toList();
    }

    @Transactional
    public AppointmentResponse cancelAppointment(UUID appointmentId) {
        Customer customer = getCurrentCustomer();
        Appointment appointment = appointmentRepository.findByIdWithDetails(appointmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPOINTMENT_NOT_FOUND));

        if (!appointment.getCustomer().getId().equals(customer.getId())
                && !SecurityUtils.hasAuthority("PERM_APPOINTMENT_UPDATE_ALL")) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.APPOINTMENT_CANNOT_CANCEL);
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment = appointmentRepository.save(appointment);
        return salonMapper.toAppointmentResponse(appointment);
    }

    @Transactional
    public AppointmentResponse confirmAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findByIdWithDetails(appointmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPOINTMENT_NOT_FOUND));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Only pending appointments can be confirmed.");
        }
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment = appointmentRepository.save(appointment);
        return salonMapper.toAppointmentResponse(appointment);
    }

    @Transactional
    public AppointmentResponse completeAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findByIdWithDetails(appointmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPOINTMENT_NOT_FOUND));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED
                || appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Appointment is already completed or cancelled.");
        }
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment = appointmentRepository.save(appointment);

        try {
            emailService.sendAppointmentThankYou(
                    appointment.getCustomer().getUser().getEmail(),
                    appointment.getCustomer().getUser().getFullName()
            );
        } catch (Exception e) {
            // Ignore email errors
        }

        return salonMapper.toAppointmentResponse(appointment);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listTodayAppointments() {
        java.time.LocalDate today = java.time.LocalDate.now();
        return appointmentRepository.findAllWithDetails().stream()
                .filter(a -> today.equals(a.getAppointmentDate()))
                .map(salonMapper::toAppointmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listMyScheduleAsEmployee() {
        UUID userId = SecurityUtils.getCurrentUserId();
        java.time.LocalDate today = java.time.LocalDate.now();
        return appointmentRepository.findAllWithDetails().stream()
                .filter(a -> today.equals(a.getAppointmentDate()))
                .filter(a -> a.getServiceLines().stream()
                        .anyMatch(line -> line.getTechnician() != null
                                && line.getTechnician().getUserId() != null
                                && line.getTechnician().getUserId().equals(userId)))
                .map(salonMapper::toAppointmentResponse)
                .toList();
    }

    private Customer getCurrentCustomer() {
        return customerRepository.findByUserId(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CUSTOMER_PROFILE_NOT_FOUND));
    }

    private Branch resolveBranch(UUID branchId) {
        if (branchId != null) {
            return branchRepository.findById(branchId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND));
        }
        return branchRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.BRANCH_NOT_FOUND, "No branch configured"));
    }

    private Employee resolveTechnician(UUID technicianId, UUID branchId) {
        if (technicianId == null) {
            return null;
        }
        Employee employee = employeeRepository.findById(technicianId)
                .orElseThrow(() -> new BusinessException(ErrorCode.EMPLOYEE_NOT_FOUND));
        if (employee.getBranchId() != null && branchId != null
                && !employee.getBranchId().equals(branchId)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Technician does not belong to the selected branch.");
        }
        return employee;
    }

    private void validateWithinBranchHours(Branch branch, LocalTime start, LocalTime end) {
        if (branch.getOpenTime() != null && start.isBefore(branch.getOpenTime())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Appointment starts before branch opening time.");
        }
        if (branch.getCloseTime() != null && end.isAfter(branch.getCloseTime())) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Appointment ends after branch closing time.");
        }
    }

    private void createInvoiceForAppointment(Appointment appointment, BigDecimal amount, String paymentMethod) {
        Invoice invoice = Invoice.builder()
                .appointment(appointment)
                .customer(appointment.getCustomer())
                .subtotal(amount)
                .discountAmount(BigDecimal.ZERO)
                .totalAmount(amount)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        invoice = invoiceRepository.save(invoice);
        
        if (paymentMethod != null && !paymentMethod.trim().isEmpty()) {
            Payment payment = Payment.builder()
                    .invoice(invoice)
                    .amount(amount)
                    .paymentMethod(paymentMethod)
                    .paymentStatus(PaymentStatus.PENDING)
                    .build();
            invoice.getPayments().add(payment);
            invoiceRepository.save(invoice);
        }
    }
}
