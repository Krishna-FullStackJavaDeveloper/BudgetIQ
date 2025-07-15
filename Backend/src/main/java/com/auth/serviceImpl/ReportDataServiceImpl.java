package com.auth.serviceImpl;

import com.auth.entity.Expense;
import com.auth.entity.Income;
import com.auth.entity.User;
import com.auth.report.ExpenseDto;
import com.auth.report.FinancialReportDto;
import com.auth.report.IncomeDto;
import com.auth.repository.ExpenseRepository;
import com.auth.repository.IncomeRepository;
import com.auth.service.ReportDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportDataServiceImpl implements ReportDataService {

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;


    @Override
    public FinancialReportDto generateTransactionReport(User user, Instant startDate, Instant endDate, ZoneId zoneId) {
        List<Income> incomeList = incomeRepository.findByUserAndDateBetweenAndDeletedFalse(user, startDate, endDate);
        List<Expense> expenseList = expenseRepository.findByUserAndDateBetweenAndDeletedFalse(user, startDate, endDate);

        List<IncomeDto> incomeDtos = incomeList.stream().map(i -> {
            IncomeDto dto = new IncomeDto();
            dto.setDate(i.getDate());
            dto.setSource(i.getSource());
            dto.setAmount(i.getAmount());
            return dto;
        }).toList();

        List<ExpenseDto> expenseDtos = expenseList.stream().map(e -> {
            ExpenseDto dto = new ExpenseDto();
            dto.setDate(e.getDate());
            dto.setCategory(e.getCategory());
            dto.setAmount(e.getAmount());
            return dto;
        }).toList();

        BigDecimal totalIncome = incomeDtos.stream()
                .map(IncomeDto::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = expenseDtos.stream()
                .map(ExpenseDto::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(zoneId);

        FinancialReportDto reportDto = new FinancialReportDto();
        reportDto.setUserFullName(user.getFullName());
        reportDto.setStartDateStr(formatter.format(startDate));
        reportDto.setEndDateStr(formatter.format(endDate));
        reportDto.setTotalIncome(totalIncome);
        reportDto.setTotalExpense(totalExpense);
        reportDto.setNetBalance(netBalance);
        reportDto.setIncomes(incomeDtos);
        reportDto.setExpenses(expenseDtos);

        return reportDto;
    }
}
