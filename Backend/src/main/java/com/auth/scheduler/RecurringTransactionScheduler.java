package com.auth.scheduler;

import com.auth.eNum.TransactionType;
import com.auth.email.EmailService;
import com.auth.email.SendNotificationEmail;
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
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecurringTransactionScheduler {
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final SendNotificationEmail sendNotificationEmail;
    @Scheduled(cron = "0 0 15 * * ?") // Every day at 3 PM UTC
//        @Scheduled(fixedRate = 60000  , zone = "UTC")// Runs every minute
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

                // Check if transaction should run on the scheduled date (not adjusted date)
                if (shouldRunToday(txn, todayInUserZone)) {

                    LocalDate adjustedDate = moveToNextWorkingDay(todayInUserZone);
                    // Duplicate check based on scheduled date (original recurring day)
                    if (!transactionExists(txn, adjustedDate)) {
                        // Create transaction with adjusted posting date
                        createTransaction(txn, adjustedDate.atStartOfDay(userZone).toInstant());
                        log.info("Created {} txn for {} scheduled on {} but posted on {}",
                                txn.getType(), txn.getTitle(), todayInUserZone, adjustedDate);

                        // ✅ Notify the user
                        sendNotificationEmail.sendTransactionNotification(txn, todayInUserZone, adjustedDate);
                    } else {
                        log.info("Skipping duplicate transaction for {} on {}", txn.getTitle(), todayInUserZone);
                    }
                    log.info("Checking if transaction already exists for {}, date: {}", txn.getTitle(), todayInUserZone);
                }
            }
        }

    private LocalDate moveToNextWorkingDay(LocalDate date) {
        LocalDate adjusted = date;
        while (isWeekend(adjusted) || isHoliday(adjusted)) {
            adjusted = adjusted.plusDays(1);
        }
        return adjusted;
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
                    txn.getUser(), txn.getTitle(), startOfDay, endOfDay);
        }
    }

    private boolean shouldRunToday(RecurringTransaction txn, LocalDate today) {
        // This method just verifies if the scheduled date matches the repeat pattern
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
                    .category(txn.getTitle())
                    .amount(txn.getAmount())
                    .date(nowUtc)
                    .createdAt(nowUtc)
                    .updatedAt(nowUtc)
                    .deleted(false)
                    .build());
        }
    }
}
