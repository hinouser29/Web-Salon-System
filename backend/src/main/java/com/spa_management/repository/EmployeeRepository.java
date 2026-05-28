package com.spa_management.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.spa_management.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    @Query("""
            SELECT e FROM Employee e
            JOIN FETCH e.user u
            WHERE (:branchId IS NULL OR e.branchId = :branchId)
            ORDER BY u.fullName
            """)
    List<Employee> findTechniciansByBranch(@Param("branchId") UUID branchId);
}
