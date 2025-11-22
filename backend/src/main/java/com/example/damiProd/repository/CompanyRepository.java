package com.example.damiProd.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.damiProd.domain.Company;

public interface CompanyRepository extends JpaRepository<Company, Long> {

}
