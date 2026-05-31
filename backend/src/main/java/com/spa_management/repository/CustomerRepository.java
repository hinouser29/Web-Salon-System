package com.spa_management.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.spa_management.entity.Customer;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    java.util.Optional<Customer> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Customer c JOIN FETCH c.user")
    java.util.List<Customer> findAllWithUser();
}
