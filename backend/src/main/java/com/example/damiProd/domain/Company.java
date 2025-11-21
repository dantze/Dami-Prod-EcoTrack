package com.example.damiProd.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Table;

@Entity
@Getter
@Setter
@Table(name = "companies")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String address;

    private String CUI;

    private String adminName;

    public Company() {
    }

    public Company(String name, String address, String CUI, String adminName) {
        this.name = name;
        this.address = address;
        this.CUI = CUI;
        this.adminName = adminName;
    }

}
