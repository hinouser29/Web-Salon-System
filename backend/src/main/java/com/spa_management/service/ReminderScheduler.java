package com.spa_management.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spa_management.entity.Appointment;
import com.spa_management.entity.AppointmentServiceLine;
import com.spa_management.entity.enums.AppointmentStatus;
import com.spa_management.repository.AppointmentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    /**
     * Run every hour to find appointments that are exactly tomorrow
     * and send a reminder email.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional(readOnly = true)
    public void sendDailyReminders() {
        log.info("Running scheduled task: sendDailyReminders");
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        // Find all confirmed or pending appointments for tomorrow
        List<Appointment> upcomingAppointments = appointmentRepository.findAllWithDetails().stream()
                .filter(a -> tomorrow.equals(a.getAppointmentDate()))
                .filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED || a.getStatus() == AppointmentStatus.PENDING)
                .toList();

        for (Appointment appt : upcomingAppointments) {
            try {
                String serviceName = "Dich vu Salon";
                if (!appt.getServiceLines().isEmpty()) {
                    AppointmentServiceLine line = appt.getServiceLines().get(0);
                    if (line.getService() != null) {
                        serviceName = line.getService().getName();
                    }
                }

                emailService.sendAppointmentReminder(
                        appt.getCustomer().getUser().getEmail(),
                        appt.getCustomer().getUser().getFullName(),
                        serviceName,
                        appt.getAppointmentDate().toString(),
                        appt.getStartTime().toString()
                );
                log.info("Sent reminder for appointment ID: {}", appt.getId());
            } catch (Exception e) {
                log.error("Failed to send reminder for appointment ID: {}", appt.getId(), e);
            }
        }
    }
}
