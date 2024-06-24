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


package com.taskmanagementsystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class })
public class TaskManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(TaskManagementSystemApplication.class, args);
    }
}
