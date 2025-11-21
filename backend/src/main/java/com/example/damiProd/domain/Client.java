package com.example.damiProd.domain;

import jakarta.persistence.Entity;

@Entity
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;

    private String phone;

    private String address;

    public Client() {
    }

    public Client(String email, String phone, String address) {
        this.email = email;
        this.phone = phone;
        this.address = address;
    }
}
