package com.example.damiProd.repository;

import com.example.damiProd.domain.RouteDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RouteDefinitionRepository extends JpaRepository<RouteDefinition, Long> {
}
