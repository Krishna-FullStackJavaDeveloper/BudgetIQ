package com.auth.scheduler;

import com.auth.eNum.AccountStatus;
import com.auth.email.EmailService;
import com.auth.entity.Expense;
import com.auth.entity.Income;
import com.auth.entity.User;
import com.auth.report.FinancialReportDto;
import com.auth.serviceImpl.PdfReportService;
import com.auth.serviceImpl.ReportService;
import com.auth.repository.UserRepository;
import com.auth.service.ExpenseService;
import com.auth.service.IncomeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReportScheduler {
    private final UserRepository userRepository;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;
    private final ReportService reportService;
    private final PdfReportService pdfReportService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 9 7 * ?") // Every month on the 7th at 9:00 AM
    public void sendMonthlyReports() {
        List<User> users = userRepository.findAll();


        for (User user : users) {
            // Only send email if account is ACTIVE
            if (user.getAccountStatus() != AccountStatus.ACTIVE) {
                continue; // skip inactive/suspended users
            }

            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("name", user.getFullName());

            try {
                ZoneId zone = ZoneId.of(user.getTimezone().getTimezone());

                LocalDate today = LocalDate.now(zone);
                LocalDate firstDayOfLastMonth = today.minusMonths(1).withDayOfMonth(1);
                LocalDate lastDayOfLastMonth = firstDayOfLastMonth.withDayOfMonth(firstDayOfLastMonth.lengthOfMonth());

                Instant start = firstDayOfLastMonth.atStartOfDay(zone).toInstant();
                Instant end = lastDayOfLastMonth.atTime(23, 59, 59).atZone(zone).toInstant();

                List<Income> incomes = incomeService.getIncomeBetween(user.getId(), start, end);
                List<Expense> expenses = expenseService.getExpenseBetween(user.getId(), start, end);

                FinancialReportDto reportDto = reportService.mapToReportDto(user, incomes, expenses, zone, start, end);
                byte[] pdf = pdfReportService.generateFinancialReportPdf(reportDto, zone);

                emailService.sendAttachment(
                        user.getEmail(),
                        "monthly-report", // <- action
                        placeholders,
                        pdf,
                        "BudgetIQ_Monthly_Report.pdf"
                );

            } catch (Exception e) {
                // Log error and continue with next user
                System.err.println("Error sending report to " + user.getEmail());
                e.printStackTrace();
            }
        }
    }

//    @EventListener(ApplicationReadyEvent.class) // Runs when app fully starts
//    public void runOnStartup() {
//        log.info("Running Report check on application startup");
//        sendMonthlyReports();
//    }

}
