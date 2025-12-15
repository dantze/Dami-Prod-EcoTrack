package com.example.damiProd.controller;

import com.example.damiProd.domain.Task;
import com.example.damiProd.domain.TaskStatus;
import com.example.damiProd.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Get all tasks
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // Get a specific task by ID
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    // Get all tasks for a specific route
    @GetMapping("/route/{routeId}")
    public ResponseEntity<List<Task>> getTasksByRoute(@PathVariable Long routeId) {
        List<Task> tasks = taskService.getTasksByRouteId(routeId);
        return ResponseEntity.ok(tasks);
    }

    // Create a new task
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Task savedTask = taskService.createTask(task);
        return ResponseEntity.ok(savedTask);
    }

    // Update task status (for driver to mark task as IN_PROGRESS, COMPLETED, etc.)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        
        String statusStr = statusUpdate.get("status");
        TaskStatus status = TaskStatus.valueOf(statusStr);
        Task updatedTask = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(updatedTask);
    }

    // Delete a task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
