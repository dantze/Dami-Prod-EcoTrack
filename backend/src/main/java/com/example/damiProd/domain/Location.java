package com.example.damiProd.domain;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "locations")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String address;

    @Embedded
    private Coordinates coordinates;

    public Location() {
    }

    public Location(String name, String address) {
        this.name = name;
        this.address = address;
    }

    @Embeddable
    @Getter
    @Setter
    public static class Coordinates {
        private double latitude;
        private double longitude;
    }
}
