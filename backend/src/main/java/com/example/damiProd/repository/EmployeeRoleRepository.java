package com.example.damiProd.repository;

import com.example.damiProd.domain.EmployeeRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRoleRepository extends JpaRepository<EmployeeRole, Long> {
    
    Optional<EmployeeRole> findByRoleName(String roleName);
}
