package com.auth.payload.request;

import com.auth.eNum.RepeatCycle;
import com.auth.eNum.TransactionType;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class RecurringTransactionRequest {
    private String title;
    private BigDecimal amount;
    private TransactionType type;
    private LocalDate startDate;
    private RepeatCycle repeatCycle;
    private String repeatDay;
    private String category;
    private LocalDate endDate;
}
