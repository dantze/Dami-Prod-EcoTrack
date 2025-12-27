package com.example.damiProd.repository;

import com.example.damiProd.domain.Task;
import com.example.damiProd.domain.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByRoute_Id(Long routeId);
    
    List<Task> findByRoute_IdAndStatus(Long routeId, TaskStatus status);
    
    // Find task by order ID
    Optional<Task> findByOrder_Id(Long orderId);
    
    // Check if a task exists for an order
    boolean existsByOrder_Id(Long orderId);
}
