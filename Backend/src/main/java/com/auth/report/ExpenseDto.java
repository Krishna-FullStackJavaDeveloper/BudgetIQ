package com.auth.report;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class ExpenseDto {
    private Instant date;
    private String category;
    private BigDecimal amount;
}
