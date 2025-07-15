package com.auth.report;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class IncomeDto {
    private Instant date;
    private String source;
    private BigDecimal amount;
}
