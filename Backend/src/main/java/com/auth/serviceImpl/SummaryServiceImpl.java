package com.auth.serviceImpl;

import com.auth.entity.Expense;
import com.auth.entity.Income;
import com.auth.entity.User;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.payload.response.MonthlySummary;
import com.auth.payload.response.SummaryResponse;
import com.auth.repository.ExpenseRepository;
import com.auth.repository.IncomeRepository;
import com.auth.repository.UserRepository;
import com.auth.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SummaryServiceImpl implements SummaryService {

    private final UserRepository userRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    public SummaryResponse getMonthlySummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Instant startDate = getEarliestDate(userId); // from first income/expense entry
        List<YearMonth> monthsToCheck = getLast6OrSinceStart(startDate);

        List<MonthlySummary> monthlyData = new ArrayList<>();

        for (YearMonth ym : monthsToCheck) {
            Instant monthStart = ym.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant monthEnd = ym.atEndOfMonth().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();

            BigDecimal income = incomeRepository.sumByUserAndDateRange(userId, monthStart, monthEnd).orElse(BigDecimal.ZERO);
            BigDecimal expense = expenseRepository.sumByUserAndDateRange(userId, monthStart, monthEnd).orElse(BigDecimal.ZERO);
            BigDecimal saving = income.subtract(expense);

            String monthLabel = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + "-" + ym.getYear();

            monthlyData.add(new MonthlySummary(monthLabel, income, expense, saving));
        }
        String timezone = user.getTimezone().getTimezone(); // "Asia/Kolkata"
        String currencyCode = user.getTimezone().getCountry().getCurrencyCode(); // "INR"
        String currencyName = user.getTimezone().getCountry().getCurrencyName(); // "Indian Rupee"

        return new SummaryResponse(user.getFullName(), monthlyData,timezone,currencyCode, currencyName);
    }

    // Utility methods

    private Instant getEarliestDate(Long userId) {
        Instant incomeStart = incomeRepository.findMinDateByUser(userId).orElse(Instant.now());
        Instant expenseStart = expenseRepository.findMinDateByUser(userId).orElse(Instant.now());
        return incomeStart.isBefore(expenseStart) ? incomeStart : expenseStart;
    }

    private List<YearMonth> getLast6OrSinceStart(Instant startDate) {
        YearMonth startMonth = YearMonth.from(startDate.atZone(ZoneId.systemDefault()));
        YearMonth currentMonth = YearMonth.now();

        List<YearMonth> result = new ArrayList<>();
        YearMonth cursor = currentMonth;
        while ((cursor.isAfter(startMonth) || cursor.equals(startMonth)) && result.size() < 6) {
            result.add(0, cursor); // add to start to maintain ascending order
            cursor = cursor.minusMonths(1);
        }
        return result;
    }
}
