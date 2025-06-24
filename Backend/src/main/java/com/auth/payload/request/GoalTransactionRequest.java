package com.auth.payload.request;

import lombok.Data;

import java.time.Instant;

@Data
public class GoalTransactionRequest {
    private Long goalId;
    private Double amount;
    private Instant date;
    private String sourceNote;
    private boolean manuallyAdded;
    private boolean autoTransferred;
}
