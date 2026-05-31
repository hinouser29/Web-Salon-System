package com.spa_management.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.spa_management.entity.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    boolean existsByAppointmentId(UUID appointmentId);

    @Query("SELECT r FROM Review r JOIN FETCH r.customer c JOIN FETCH c.user u " +
           "LEFT JOIN FETCH r.employee e LEFT JOIN FETCH e.user eu " +
           "WHERE r.service.id = :serviceId AND r.status = 'APPROVED' " +
           "ORDER BY r.createdAt DESC")
    List<Review> findByServiceIdAndStatusApproved(@Param("serviceId") UUID serviceId);

    @Query("SELECT r FROM Review r JOIN FETCH r.customer c JOIN FETCH c.user u " +
           "LEFT JOIN FETCH r.employee e LEFT JOIN FETCH e.user eu " +
           "WHERE r.employee.id = :employeeId AND r.status = 'APPROVED' " +
           "ORDER BY r.createdAt DESC")
    List<Review> findByEmployeeIdAndStatusApproved(@Param("employeeId") UUID employeeId);

    @Query("SELECT r FROM Review r JOIN FETCH r.customer c JOIN FETCH c.user u " +
           "LEFT JOIN FETCH r.employee e LEFT JOIN FETCH e.user eu " +
           "LEFT JOIN FETCH r.service s " +
           "ORDER BY r.createdAt DESC")
    List<Review> findAllWithDetails();
}
