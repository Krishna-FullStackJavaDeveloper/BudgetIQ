package com.auth.payload.request;

import lombok.Data;

import java.time.Instant;

@Data
public class SavingGoalRequest {
    private String title;
    private Double targetAmount;
    private Instant startDate;
    private Instant endDate;
    private Integer priority;
    private String sourceCategory; // optional
}
