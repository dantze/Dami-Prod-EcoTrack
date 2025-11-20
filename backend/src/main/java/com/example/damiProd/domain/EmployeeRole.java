package com.example.damiProd.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "employee_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "employees") // Previne erorile de StackOverflow
@EqualsAndHashCode(exclude = "employees") // Previne erorile de StackOverflow
public class EmployeeRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roleName; // e.g., "SALES", "DRIVER", "TECH"

    @ManyToMany(mappedBy = "roles")
    private Set<Employee> employees = new HashSet<>();

    public EmployeeRole(String roleName) {
        this.roleName = roleName;
    }
}