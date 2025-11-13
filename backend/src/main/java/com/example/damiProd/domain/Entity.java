package com.example.damiProd.domain;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import java.io.Serializable;
import java.util.Objects;

/**
 * Supraclasa abstracta pentru toate entitatile.
 * Ofera un ID de tip Long, auto-incrementat.
 * * @MappedSuperclass - Ii spune lui JPA (Hibernate) sa nu creeze un tabel
 * pentru aceasta clasa, ci doar sa includa campurile ei in tabelele
 * claselor care o extind (cum ar fi User).
 */
@MappedSuperclass
public abstract class Entity<ID extends Serializable> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private ID id; // Cheia primara, generata automat

    public ID getId() {
        return id;
    }

    public void setId(ID id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Entity<?> entity = (Entity<?>) o;
        return Objects.equals(id, entity.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}