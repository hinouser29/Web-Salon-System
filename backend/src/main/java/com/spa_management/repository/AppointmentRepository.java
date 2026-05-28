package com.spa_management.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.spa_management.entity.Appointment;
import com.spa_management.entity.enums.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    @Query("""
            SELECT DISTINCT a FROM Appointment a
            JOIN FETCH a.customer c
            JOIN FETCH c.user
            LEFT JOIN FETCH a.branch
            LEFT JOIN FETCH a.serviceLines sl
            LEFT JOIN FETCH sl.service
            LEFT JOIN FETCH sl.technician t
            LEFT JOIN FETCH t.user
            WHERE c.id = :customerId
            ORDER BY a.appointmentDate DESC, a.startTime DESC
            """)
    List<Appointment> findByCustomerIdWithDetails(@Param("customerId") UUID customerId);

    @Query("""
            SELECT DISTINCT a FROM Appointment a
            JOIN FETCH a.customer c
            JOIN FETCH c.user
            LEFT JOIN FETCH a.branch
            LEFT JOIN FETCH a.serviceLines sl
            LEFT JOIN FETCH sl.service
            LEFT JOIN FETCH sl.technician t
            LEFT JOIN FETCH t.user
            WHERE a.id = :id
            """)
    Optional<Appointment> findByIdWithDetails(@Param("id") UUID id);

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM appointment_services asl
                JOIN appointments a ON a.id = asl.appointment_id
                WHERE asl.technician_id = :technicianId
                  AND a.appointment_date = :date
                  AND a.status NOT IN ('CANCELLED')
                  AND a.start_time < :endTime
                  AND a.end_time > :startTime
                  AND (:excludeAppointmentId IS NULL OR a.id <> CAST(:excludeAppointmentId AS uuid))
            )
            """, nativeQuery = true)
    boolean existsTechnicianOverlap(
            @Param("technicianId") UUID technicianId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeAppointmentId") UUID excludeAppointmentId);

    List<Appointment> findByStatusInOrderByAppointmentDateDescStartTimeDesc(List<AppointmentStatus> statuses);

    @Query("""
            SELECT DISTINCT a FROM Appointment a
            JOIN FETCH a.customer c
            JOIN FETCH c.user
            LEFT JOIN FETCH a.branch
            LEFT JOIN FETCH a.serviceLines sl
            LEFT JOIN FETCH sl.service
            LEFT JOIN FETCH sl.technician t
            LEFT JOIN FETCH t.user
            ORDER BY a.appointmentDate DESC, a.startTime DESC
            """)
    List<Appointment> findAllWithDetails();
}
