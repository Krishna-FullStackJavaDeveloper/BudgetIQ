package com.auth.payload.response;

import com.auth.entity.GoalTransaction;
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

    public static GoalTransactionResponse fromEntity(GoalTransaction txn) {
        GoalTransactionResponse res = new GoalTransactionResponse();
        res.setId(txn.getId());
        res.setAmount(txn.getAmount());
        res.setDate(txn.getDate().toString()); // You can format if needed
        res.setSourceNote(txn.getSourceNote());
        res.setManuallyAdded(txn.isManuallyAdded());
        res.setAutoTransferred(txn.isAutoTransferred());
        res.setCreatedAt(txn.getCreatedAt().toString()); // Format if needed
        return res;
    }
}
