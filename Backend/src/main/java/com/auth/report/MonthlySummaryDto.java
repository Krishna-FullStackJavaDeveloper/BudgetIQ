package com.auth.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummaryDto {
    private String monthLabel;        // e.g. "Jan 2025"
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;

    public BigDecimal getNetBalance() {
        return totalIncome.subtract(totalExpense);
    }

}
