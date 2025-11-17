package com.example.damiProd.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@EqualsAndHashCode(callSuper = true) // Important pt. ierarhie
@NoArgsConstructor
@DiscriminatorValue("SOFER") // Valoarea care va fi scrisa in coloana "employee_type"
public class Driver extends Employee {

    private String categoriePermis;

    // Constructor
    public Driver(String email, String parola, String nume, String telefon, String categoriePermis) {
        super(email, parola, nume, telefon); // Cheama constructorul din Employee
        this.categoriePermis = categoriePermis;
    }
}