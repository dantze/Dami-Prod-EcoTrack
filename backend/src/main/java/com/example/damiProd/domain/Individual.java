package com.example.damiProd.domain;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Table;

@Entity
@Getter
@Setter
@Table(name = "individual")
public class Individual extends Client {

    private String fullName;

    private String CNP;

    // Stores the GCS URL of their ID photo
    private String idPhotoUrl;

    public Individual() {
    }

    public Individual(String email, String phone, String address, String fullName, String CNP) {
        super(email, phone, address);
        this.fullName = fullName;
        this.CNP = CNP;
    }

}
