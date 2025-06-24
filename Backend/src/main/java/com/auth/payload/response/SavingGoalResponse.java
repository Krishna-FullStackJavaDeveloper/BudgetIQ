package com.auth.payload.response;

import lombok.Data;

import java.time.Instant;

@Data
public class SavingGoalResponse {
    private Long id;
    private String title;
    private Double targetAmount;
    private String startDate;
    private String endDate;
    private boolean active;
    private boolean achieved;
    private Integer priority;
    private String sourceCategory;

    private Double totalSaved;
    private Double progressPercent;

    private String createdAt;
    private String updatedAt;
}
