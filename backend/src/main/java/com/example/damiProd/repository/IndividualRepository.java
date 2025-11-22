package com.example.damiProd.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.damiProd.domain.Individual;

public interface IndividualRepository extends JpaRepository<Individual, Long> {

}
