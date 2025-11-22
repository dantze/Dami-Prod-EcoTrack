package com.example.damiProd.domain;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Table;

@Entity
@Getter
@Setter
@Table(name = "companies")
public class Company extends Client {

    private String name;

    private String CUI;

    private String adminName;

    public Company() {
    }

    public Company(String email, String phone, String address, String name, String CUI, String adminName) {
        super(email, phone, address);
        this.name = name;
        this.CUI = CUI;
        this.adminName = adminName;
    }

}
