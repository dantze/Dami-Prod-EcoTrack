package com.example.damiProd.service;

import com.example.damiProd.domain.Task;
import com.example.damiProd.domain.TaskStatus;
import com.example.damiProd.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task-ul nu a fost găsit"));
    }

    public List<Task> getTasksByRouteId(Long routeId) {
        return taskRepository.findByRouteId(routeId);
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTaskStatus(Long taskId, TaskStatus status) {
        Task task = getTaskById(taskId);
        task.setStatus(status);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
