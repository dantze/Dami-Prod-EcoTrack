package com.example.damiProd.domain;

import jakarta.persistence.*;

@Entity
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

    // --- Constructori ---
    public TaskPhoto() {}

    public TaskPhoto(String imageUrl, String description, Task task) {
        this.imageUrl = imageUrl;
        this.description = description;
        this.task = task;
    }

    // --- Getters și Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }
}