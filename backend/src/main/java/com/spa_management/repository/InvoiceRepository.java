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
}
