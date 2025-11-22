package com.example.damiProd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.damiProd.domain.Client;

public interface ClientRepository extends JpaRepository<Client, Long> {

}
