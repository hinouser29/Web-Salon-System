package com.spa_management.mapper;

import org.springframework.stereotype.Component;

import com.spa_management.dto.response.AppointmentResponse;
import com.spa_management.dto.response.BranchResponse;
import com.spa_management.dto.response.InvoiceResponse;
import com.spa_management.dto.response.ServiceResponse;
import com.spa_management.dto.response.TechnicianResponse;
import com.spa_management.entity.Appointment;
import com.spa_management.entity.AppointmentServiceLine;
import com.spa_management.entity.Branch;
import com.spa_management.entity.Employee;
import com.spa_management.entity.Invoice;
import com.spa_management.entity.Payment;
import com.spa_management.entity.SalonService;

@Component
public class SalonMapper {

    public ServiceResponse toServiceResponse(SalonService service) {
        return ServiceResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .durationMinutes(service.getDurationMinutes())
                .price(service.getPrice())
                .imageUrl(service.getImageUrl())
                .categoryName(service.getCategory() != null ? service.getCategory().getName() : null)
                .build();
    }

    public BranchResponse toBranchResponse(Branch branch) {
        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .phone(branch.getPhone())
                .openTime(branch.getOpenTime())
                .closeTime(branch.getCloseTime())
                .build();
    }

    public TechnicianResponse toTechnicianResponse(Employee employee) {
        return TechnicianResponse.builder()
                .id(employee.getId())
                .fullName(employee.getUser().getFullName())
                .position(employee.getPosition())
                .specialization(employee.getSpecialization())
                .branchId(employee.getBranchId())
                .build();
    }

    public AppointmentResponse toAppointmentResponse(Appointment appointment) {
        var lines = appointment.getServiceLines().stream()
                .map(this::toLineResponse)
                .toList();
        return AppointmentResponse.builder()
                .id(appointment.getId())
                .appointmentDate(appointment.getAppointmentDate())
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .branchName(appointment.getBranch() != null ? appointment.getBranch().getName() : null)
                .lines(lines)
                .build();
    }

    private AppointmentResponse.AppointmentLineResponse toLineResponse(AppointmentServiceLine line) {
        String techName = line.getTechnician() != null && line.getTechnician().getUser() != null
                ? line.getTechnician().getUser().getFullName()
                : null;
        return AppointmentResponse.AppointmentLineResponse.builder()
                .serviceId(line.getService().getId())
                .serviceName(line.getService().getName())
                .technicianName(techName)
                .price(line.getPrice())
                .build();
    }

    public InvoiceResponse toInvoiceResponse(Invoice invoice) {
        String summary = invoice.getAppointment() != null
                && !invoice.getAppointment().getServiceLines().isEmpty()
                ? invoice.getAppointment().getServiceLines().get(0).getService().getName()
                : "Dịch vụ salon";

        String method = invoice.getPayments().stream()
                .filter(p -> p.getPaymentStatus() == com.spa_management.entity.enums.PaymentStatus.PAID)
                .map(Payment::getPaymentMethod)
                .findFirst()
                .orElse(null);

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .appointmentId(invoice.getAppointment() != null ? invoice.getAppointment().getId() : null)
                .serviceSummary(summary)
                .subtotal(invoice.getSubtotal())
                .discountAmount(invoice.getDiscountAmount())
                .totalAmount(invoice.getTotalAmount())
                .paymentStatus(invoice.getPaymentStatus())
                .paymentMethod(method)
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}
