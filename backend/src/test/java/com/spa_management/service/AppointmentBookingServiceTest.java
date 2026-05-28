package com.spa_management.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.spa_management.dto.request.CreateAppointmentRequest;
import com.spa_management.entity.Branch;
import com.spa_management.entity.Customer;
import com.spa_management.entity.SalonService;
import com.spa_management.entity.ServiceCategory;
import com.spa_management.entity.User;
import com.spa_management.entity.enums.AuthProvider;
import com.spa_management.entity.enums.Role;
import com.spa_management.entity.enums.UserStatus;
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
import com.spa_management.security.CustomUserDetails;

@ExtendWith(MockitoExtension.class)
class AppointmentBookingServiceTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private SalonServiceRepository salonServiceRepository;
    @Mock private BranchRepository branchRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private UserRepository userRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private SalonMapper salonMapper;

    @InjectMocks
    private AppointmentBookingService appointmentBookingService;

    private final UUID userId = UUID.randomUUID();
    private final UUID customerId = UUID.randomUUID();
    private final UUID branchId = UUID.randomUUID();
    private final UUID serviceId = UUID.randomUUID();
    private final UUID technicianId = UUID.randomUUID();

    @BeforeEach
    void setUpSecurityContext() {
        User user = User.builder()
                .id(userId)
                .email("c@test.com")
                .provider(AuthProvider.LOCAL)
                .role(Role.CUSTOMER)
                .verified(true)
                .status(UserStatus.ACTIVE)
                .build();
        CustomUserDetails details = new CustomUserDetails(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities()));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createAppointment_shouldRejectWhenTechnicianSlotTaken() {
        Customer customer = Customer.builder().id(customerId).user(User.builder().id(userId).build()).build();
        Branch branch = Branch.builder().id(branchId).name("B1").address("A").openTime(LocalTime.of(8, 0)).closeTime(LocalTime.of(21, 0)).build();
        SalonService service = SalonService.builder()
                .id(serviceId)
                .name("Massage")
                .durationMinutes(60)
                .price(BigDecimal.valueOf(500000))
                .category(ServiceCategory.builder().name("Spa").build())
                .active(true)
                .build();

        when(customerRepository.findByUserId(userId)).thenReturn(Optional.of(customer));
        when(salonServiceRepository.findActiveByIdWithCategory(serviceId)).thenReturn(Optional.of(service));
        when(branchRepository.findById(branchId)).thenReturn(Optional.of(branch));
        User techUser = User.builder().id(UUID.randomUUID()).email("tech@test.com").fullName("Tech").build();
        when(employeeRepository.findById(technicianId)).thenReturn(Optional.of(
                com.spa_management.entity.Employee.builder().id(technicianId).branchId(branchId).user(techUser).build()));
        when(appointmentRepository.existsTechnicianOverlap(
                eq(technicianId), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class), isNull()))
                .thenReturn(true);

        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .serviceId(serviceId)
                .branchId(branchId)
                .technicianId(technicianId)
                .appointmentDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(10, 0))
                .build();

        assertThatThrownBy(() -> appointmentBookingService.createAppointment(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> org.assertj.core.api.Assertions.assertThat(
                        ((BusinessException) ex).getErrorCode()).isEqualTo(ErrorCode.APPOINTMENT_SLOT_UNAVAILABLE));
    }
}
