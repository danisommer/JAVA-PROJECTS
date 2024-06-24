/*============================================================================*/
/* Task Management System                                                     */
/*----------------------------------------------------------------------------*/
/* Author: Daniel Zaki Sommer                                                 */
/* Github: https://github.com/danisommer                                      */
/* Telephone: +55 (41) 99708-5707                                             */
/* Email: danielsommer@alunos.utfpr.edu.br                                    */
/* LinkedIn: www.linkedin.com/in/danisommer                                   */
/*============================================================================*/
/*  This program manages tasks, allowing filtering by status, date range, and */
/* search term.                                                               */
/*============================================================================*/


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
    private final TaskRepository taskRepository;

    @Autowired
    private EmailService emailService;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public Task createTask(@Valid Task task) {
        if (isWeekday(LocalDate.now())) {
            task.setCreatedAt(LocalDate.now());
            return taskRepository.save(task);
        } else {
            throw new IllegalArgumentException("Tasks can only be created on weekdays (Monday to Friday).");
        }
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
    public Task updateTaskStatus(Long id, @Valid Task task) {
        Optional<Task> existingTaskOptional = taskRepository.findById(id);
        if (existingTaskOptional.isPresent()) {
            Task existingTask = existingTaskOptional.get();
            existingTask.setStatus(task.getStatus());
            Task updatedTask = taskRepository.save(existingTask);
            if (task.getStatus() == Task.TaskStatus.PENDING) {
                sendTaskReminderNotification(existingTask);
            }

            return updatedTask;
        } else {
            throw new IllegalArgumentException("Task not found with ID: " + id);
        }
    }

    private void sendTaskReminderNotification(Task task) {
        String email = "danibee2005@gmail.com";
        String subject = "Reminder: Pending Task";
        String text = "You have a pending task: " + task.getTitle();

        emailService.sendEmail(email, subject, text);
    }

    @Override
    public void deleteTask(Long id) {
        Optional<Task> existingTaskOptional = taskRepository.findById(id);
        if (existingTaskOptional.isPresent()) {
            Task existingTask = existingTaskOptional.get();
            if (existingTask.getStatus() == Task.TaskStatus.PENDING && isOlderThanFiveDays(existingTask.getCreatedAt())) {
                taskRepository.delete(existingTask);
            } else {
                throw new IllegalArgumentException("Tasks can only be deleted if they are in PENDING status and created more than 5 days ago.");
            }
        } else {
            throw new IllegalArgumentException("Task not found with ID: " + id);
        }
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

