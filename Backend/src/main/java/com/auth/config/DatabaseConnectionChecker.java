package com.auth.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;


@Component
public class DatabaseConnectionChecker {

    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    public DatabaseConnectionChecker(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void checkDatabaseConnection() {
        int retries = 5;
        while (retries > 0) {
            try {
                // Try to connect to the database by executing a simple query
                jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                System.out.println("Database connected successfully: " + databaseUrl);
                break; // Exit the loop if the connection is successful
            } catch (DataAccessException e) {
                retries--;
                System.err.println("Database connection failed. Retries left: " + retries);
                if (retries == 0) {
                    throw new RuntimeException("Database is not available after retries");
                }
                try {
                    Thread.sleep(5000); // Wait for 5 seconds before retrying
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }
}