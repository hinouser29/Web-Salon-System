package com.spa_management.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.spa_management.entity.Invoice;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    @Query("""
            SELECT DISTINCT i FROM Invoice i
            JOIN FETCH i.customer c
            LEFT JOIN FETCH i.appointment a
            LEFT JOIN FETCH a.serviceLines sl
            LEFT JOIN FETCH sl.service
            LEFT JOIN FETCH i.payments
            WHERE c.id = :customerId
            ORDER BY i.createdAt DESC
            """)
    List<Invoice> findByCustomerIdWithPayments(@Param("customerId") UUID customerId);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.paymentStatus = 'PAID' AND i.createdAt >= :startDate AND i.createdAt <= :endDate")
    java.math.BigDecimal sumPaidRevenueBetween(@Param("startDate") java.time.Instant startDate, @Param("endDate") java.time.Instant endDate);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.paymentStatus = 'PAID' AND i.createdAt >= :startDate")
    java.math.BigDecimal sumPaidRevenueSince(@Param("startDate") java.time.Instant startDate);

    @Query("""
            SELECT i FROM Invoice i
            LEFT JOIN FETCH i.payments
            WHERE i.appointment.id = :appointmentId
            """)
    java.util.Optional<Invoice> findByAppointmentIdWithPayments(@Param("appointmentId") UUID appointmentId);
}
