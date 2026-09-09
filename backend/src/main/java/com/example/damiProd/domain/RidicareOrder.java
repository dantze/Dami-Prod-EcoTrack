package com.example.damiProd.domain;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "ridicare_orders")
public class RidicareOrder extends Order {

    // The physical product (cabin/portable toilet) being picked up
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private LocalDate pickupDate;
    private Integer pickupQuantity;
    private String pickupProductName; // Denormalized name for quick display
    private String pickupLocationAddress;
    private String pickupLocationCoordinates; // "lat,long"

    public RidicareOrder() {
        super();
    }
}
