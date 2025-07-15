package com.auth.report;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class FinancialReportDto {

    private String userFullName;
    private String startDateStr; // formatted date string
    private String endDateStr;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netBalance;
    private List<IncomeDto> incomes;
    private List<ExpenseDto> expenses;

    private List<MonthlySummaryDto> monthlyBreakdown;
}

