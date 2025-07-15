package com.auth.serviceImpl;

import com.auth.entity.Expense;
import com.auth.entity.Income;
import com.auth.entity.User;
import com.auth.report.ExpenseDto;
import com.auth.report.FinancialReportDto;
import com.auth.report.IncomeDto;
import com.auth.report.MonthlySummaryDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class ReportService {
    // This method maps entities to DTOs for report generation
    public FinancialReportDto mapToReportDto(User user, List<Income> incomes, List<Expense> expenses,
                                             ZoneId userZone, Instant reportStart, Instant reportEnd) {
        FinancialReportDto reportDto = new FinancialReportDto();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(userZone);
        reportDto.setUserFullName(user.getFullName());
        reportDto.setStartDateStr(fmt.format(reportStart));
        reportDto.setEndDateStr(fmt.format(reportEnd));

        BigDecimal totalIncome = incomes.stream()
                .map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        reportDto.setTotalIncome(totalIncome);
        reportDto.setTotalExpense(totalExpense);
        reportDto.setNetBalance(totalIncome.subtract(totalExpense));

        List<IncomeDto> incomeDtos = incomes.stream().map(income -> {
            IncomeDto dto = new IncomeDto();
            dto.setDate(income.getDate());
            dto.setSource(income.getSource());
            dto.setAmount(income.getAmount());
            return dto;
        }).toList();

        List<ExpenseDto> expenseDtos = expenses.stream().map(expense -> {
            ExpenseDto dto = new ExpenseDto();
            dto.setDate(expense.getDate());
            dto.setCategory(expense.getCategory());
            dto.setAmount(expense.getAmount());
            return dto;
        }).toList();

        Map<String, MonthlySummaryDto> monthMap = new TreeMap<>();

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy").withZone(userZone);

// Aggregate income
        for (Income income : incomes) {
            String month = monthFormatter.format(income.getDate());
            MonthlySummaryDto summary = monthMap.computeIfAbsent(month, m -> new MonthlySummaryDto(m, BigDecimal.ZERO, BigDecimal.ZERO));
            summary.setTotalIncome(summary.getTotalIncome().add(income.getAmount()));
        }

// Aggregate expense
        for (Expense expense : expenses) {
            String month = monthFormatter.format(expense.getDate());
            MonthlySummaryDto summary = monthMap.computeIfAbsent(month, m -> new MonthlySummaryDto(m, BigDecimal.ZERO, BigDecimal.ZERO));
            summary.setTotalExpense(summary.getTotalExpense().add(expense.getAmount()));
        }

        reportDto.setMonthlyBreakdown(new ArrayList<>(monthMap.values()));


        reportDto.setIncomes(incomeDtos);
        reportDto.setExpenses(expenseDtos);

        return reportDto;
    }


}
