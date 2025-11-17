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
@DiscriminatorValue("TEHNIC")
public class Tech extends Employee {

    // Am tradus "todo" ca "sarcini"
    private String toDoTech;

    // Constructor
    public Tech(String email, String parola, String nume, String telefon, String sarciniTehnice) {
        super(email, parola, nume, telefon);
        this.toDo = sarciniTehnice;
    }
}