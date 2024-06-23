package com.taskmanagementsystem.repository;

import com.taskmanagementsystem.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByStatus(Task.TaskStatus status);

    List<Task> findByCreatedAtAfter(LocalDate date);
}
