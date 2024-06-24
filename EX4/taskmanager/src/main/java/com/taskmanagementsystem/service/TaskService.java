package com.taskmanagementsystem.service;

import com.taskmanagementsystem.model.Task;
import jakarta.validation.Valid;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface TaskService {

    List<Task> getAllTasks();

    Task createTask(Task task);

    Task updateTask(Long id, Task task);

    Task updateTaskStatus(Long id, @Valid Task task);

    void deleteTask(Long id);

    Task getTaskById(Long id);

    List<Task> findTasksByStatus(Task.TaskStatus status);

    List<Task> findTasksCreatedAfter(LocalDate date);

}
