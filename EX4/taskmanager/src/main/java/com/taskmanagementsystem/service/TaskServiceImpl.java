package com.taskmanagementsystem.service;

import com.taskmanagementsystem.model.Task;
import com.taskmanagementsystem.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public Task createTask(@Valid Task task) {
        //if (isWeekday(LocalDate.now())) {
            task.setCreatedAt(LocalDate.now());
            return taskRepository.save(task);
        //} else {
        //    throw new IllegalArgumentException("Tasks can only be created on weekdays (Monday to Friday).");
        //}
    }

    @Override
    public Task updateTask(Long id, @Valid Task task) {
        Optional<Task> existingTaskOptional = taskRepository.findById(id);
        if (existingTaskOptional.isPresent()) {
            Task existingTask = existingTaskOptional.get();
            if (existingTask.getStatus() == Task.TaskStatus.PENDING) {
                existingTask.setTitle(task.getTitle());
                existingTask.setDescription(task.getDescription());
                return taskRepository.save(existingTask);
            } else {
                throw new IllegalArgumentException("Tasks can only be updated if they are in PENDING status.");
            }
        } else {
            throw new IllegalArgumentException("Task not found with ID: " + id);
        }
    }

    @Override
    public void deleteTask(Long id) {
        Optional<Task> existingTaskOptional = taskRepository.findById(id);
        if (existingTaskOptional.isPresent()) {
            Task existingTask = existingTaskOptional.get();
            //if (existingTask.getStatus() == Task.TaskStatus.PENDING && isOlderThanFiveDays(existingTask.getCreatedAt())) {
                taskRepository.delete(existingTask);
            //} else {
            //    throw new IllegalArgumentException("Tasks can only be deleted if they are in PENDING status and created more than 5 days ago.");
            //}
        } else {
            throw new IllegalArgumentException("Task not found with ID: " + id);
        }
    }

    @Override
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
    }

    @Override
    public List<Task> findTasksByStatus(Task.TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    @Override
    public List<Task> findTasksCreatedAfter(Date date) {
        return List.of();
    }

    @Override
    public List<Task> findTasksCreatedAfter(LocalDate date) {
        return taskRepository.findByCreatedAtAfter(date);
    }

    private boolean isWeekday(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return !(dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY);
    }

    private boolean isOlderThanFiveDays(LocalDate createdAt) {
        LocalDate today = LocalDate.now();
        return createdAt.plusDays(5).isBefore(today);
    }
}
