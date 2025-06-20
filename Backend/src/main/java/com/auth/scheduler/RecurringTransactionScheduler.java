package com.auth.scheduler;

import com.auth.eNum.TransactionType;
import com.auth.entity.Expense;
import com.auth.entity.Income;
import com.auth.entity.RecurringTransaction;
import com.auth.globalUtils.TimezoneUtil;
import com.auth.repository.ExpenseRepository;
import com.auth.repository.IncomeRepository;
import com.auth.repository.RecurringTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionScheduler {
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;

//    @Scheduled(cron = "0 0 15 * * ?") // Every day at 1 AM UTC
        @Scheduled(fixedRate = 60000 , zone = "UTC")// Runs every hour
    public void processRecurringTransactions() {
            log.info("Running recurring transaction scheduler");


            // We use UTC now, but will compute each user's local date
            Instant nowUtc = Instant.now();

            List<RecurringTransaction> transactions =
                    recurringTransactionRepository.findAllActiveWithUser(LocalDate.now(ZoneOffset.UTC));

            for (RecurringTransaction txn : transactions) {
                if (!txn.isEnabled()) continue;

                // Skip if ended
                if (txn.getEndDate() != null && txn.getEndDate().isBefore(LocalDate.now(ZoneOffset.UTC))) continue;

                // Get the user's local date
                ZoneId userZone = TimezoneUtil.getUserZone(txn.getUser());
                LocalDate todayInUserZone = LocalDate.now(userZone);

                // Check if today in user's zone matches their schedule
                if (shouldRunToday(txn, todayInUserZone) && !isWeekend(todayInUserZone) && !isHoliday(todayInUserZone)) {
                    if (!transactionExists(txn, todayInUserZone)) {
                        createTransaction(txn, nowUtc);
                        log.info("Created {} txn for {} on {}", txn.getType(), txn.getTitle(), todayInUserZone);
                    } else {
                        log.info("Skipping duplicate transaction for {} on {}", txn.getTitle(), todayInUserZone);
                    }


                    log.info("Checking if transaction already exists for {}, date: {}", txn.getTitle(), todayInUserZone);
                }
            }
        }

//        Skipping weekends/holidays
    private boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

    private boolean isHoliday(LocalDate date) {
        // Implement your holiday logic here; return true if holiday
        return false;
    }
//Duplicate prevention if job is retried or re-triggered.
    private boolean transactionExists(RecurringTransaction txn, LocalDate userToday) {
        ZoneId userZone = TimezoneUtil.getUserZone(txn.getUser());

        Instant startOfDay = userToday.atStartOfDay(userZone).toInstant();
        Instant endOfDay = userToday.plusDays(1).atStartOfDay(userZone).toInstant().minusMillis(1);

        if (txn.getType() == TransactionType.INCOME) {
            return incomeRepository.existsByUserAndSourceAndDateBetween(
                    txn.getUser(), txn.getTitle(), startOfDay, endOfDay);
        } else {
            return expenseRepository.existsByUserAndCategoryAndDateBetween(
                    txn.getUser(), txn.getCategory(), startOfDay, endOfDay);
        }
    }

    private boolean shouldRunToday(RecurringTransaction txn, LocalDate today) {
        return switch (txn.getRepeatCycle()) {
            case DAILY -> true;

            case WEEKLY -> txn.getRepeatDay() != null &&
                    today.getDayOfWeek().name().equalsIgnoreCase(txn.getRepeatDay().trim());

            case MONTHLY -> {
                try {
                    int day = Integer.parseInt(txn.getRepeatDay());
                    yield today.getDayOfMonth() == day;
                } catch (NumberFormatException e) {
                    yield false;
                }
            }

            case YEARLY -> {
                try {
                    int day = Integer.parseInt(txn.getRepeatDay());
                    yield today.getDayOfMonth() == day &&
                            today.getMonth() == txn.getStartDate().getMonth();
                } catch (NumberFormatException e) {
                    yield false;
                }
            }

            default -> false;
        };
    }


    private void createTransaction(RecurringTransaction txn, Instant nowUtc) {
        if (txn.getType() == TransactionType.INCOME) {
            incomeRepository.save(Income.builder()
                    .user(txn.getUser())
                    .source(txn.getTitle())
                    .amount(txn.getAmount())
                    .date(nowUtc)
                    .createdAt(nowUtc)
                    .updatedAt(nowUtc)
                    .deleted(false)
                    .build());
        } else {
            expenseRepository.save(Expense.builder()
                    .user(txn.getUser())
                    .category(txn.getCategory())
                    .amount(txn.getAmount())
                    .date(nowUtc)
                    .createdAt(nowUtc)
                    .updatedAt(nowUtc)
                    .deleted(false)
                    .build());
        }
    }
}
