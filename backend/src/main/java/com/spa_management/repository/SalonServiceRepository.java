package com.spa_management.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.spa_management.entity.SalonService;

@Repository
public interface SalonServiceRepository extends JpaRepository<SalonService, UUID> {

    @Query("""
            SELECT s FROM SalonService s
            LEFT JOIN FETCH s.category
            WHERE s.active = true
            ORDER BY s.name
            """)
    List<SalonService> findAllActiveWithCategory();

    @Query("""
            SELECT s FROM SalonService s
            LEFT JOIN FETCH s.category
            WHERE s.id = :id AND s.active = true
            """)
    java.util.Optional<SalonService> findActiveByIdWithCategory(UUID id);
}
