package com.example.damiProd.repository;

import com.example.damiProd.domain.Task;
import com.example.damiProd.domain.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByRouteId(Long routeId);
    
    List<Task> findByRouteIdAndStatus(Long routeId, TaskStatus status);
}
