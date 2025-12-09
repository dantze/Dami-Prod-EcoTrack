package com.example.damiProd.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "task_photos")
public class TaskPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String imageUrl;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    public TaskPhoto() {
    }

    public TaskPhoto(String imageUrl, String description, Task task) {
        this.imageUrl = imageUrl;
        this.description = description;
        this.task = task;
    }
}