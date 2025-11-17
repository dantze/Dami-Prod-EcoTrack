package com.example.damiProd.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

/**
 * Clasa de baza pentru toti angajatii.
 *
 * @Inheritance(strategy = InheritanceType.SINGLE_TABLE)
 * Ii spune lui JPA sa foloseasca o singura tabela pentru toata ierarhia.
 *
 * @DiscriminatorColumn(name = "employee_type")
 * Numele coloanei care va stoca tipul (ex: "SOFER", "VANZARI").
 *
 * @Data (Lombok) - Genereaza Getters, Setters, toString() etc.
 * @NoArgsConstructor (Lombok) - Constructor gol (cerut de JPA).
 */
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "employee_type")
@Data
@NoArgsConstructor
@Table(name = "employees") // Folosim "employees" ca nume de tabela
public abstract class Employee implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Am interpretat "username (email)" ca fiind un camp de email unic
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;
    private String name;
    private String phone;

    // Constructor util (fara ID, ca sa fie generat)
    public Employee(String email, String password, String name, String phone) {
        this.phone = phone;
        this.email = email;
        this.password = password;
        this.name = name;
    }
}