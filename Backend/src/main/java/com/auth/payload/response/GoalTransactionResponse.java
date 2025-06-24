package com.auth.payload.response;

import lombok.Data;

@Data
public class GoalTransactionResponse {
    private Long id;
    private Double amount;
    private String date;
    private String sourceNote;
    private boolean manuallyAdded;
    private boolean autoTransferred;

    private String createdAt;
}
