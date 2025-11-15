package com.example.damiProd.domain;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@DiscriminatorValue("VANZARI")
public class Sales extends Employee {

    // Am tradus "todo" ca "sarcini"
    private String toDoSales;

    // Constructor
    public Sales(String email, String parola, String nume, String telefon, String sarciniVanzari) {
        super(email, parola, nume, telefon);
        this.toDoSales = sarciniVanzari;
    }
}