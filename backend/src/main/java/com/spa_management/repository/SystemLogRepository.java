package com.spa_management.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.spa_management.entity.SystemLog;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, UUID> {
    
    @Query("SELECT s FROM SystemLog s LEFT JOIN FETCH s.user ORDER BY s.createdAt DESC")
    Page<SystemLog> findAllWithUser(Pageable pageable);
}
