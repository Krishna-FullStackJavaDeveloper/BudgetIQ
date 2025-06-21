package com.auth.email;

import com.auth.entity.RecurringTransaction;
import com.auth.entity.User;
import com.auth.globalUtils.TimezoneUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class SendNotificationEmail {

    private final EmailService emailService;

    public void sendTransactionNotification(RecurringTransaction txn, LocalDate scheduledDate, LocalDate actualPostedDate) {
        User user = txn.getUser(); // assuming you have a getUser() method

        String email = user.getEmail();
        String userName = user.getFullName(); // or getUsername()

        ZonedDateTime nowInUserZone = ZonedDateTime.now(TimezoneUtil.getUserZone(user));
//        String formattedProcessedTime = nowInUserZone.format(DateTimeFormatter.ofPattern("EEEE, MMM dd yyyy - HH:mm z"));

        String formattedScheduledDate = scheduledDate.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
        String formattedPostedDate = actualPostedDate.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));

        String subject = "Recurring Transaction: " + txn.getTitle();

        String body = String.format("""
        <p>Hello %s,</p>
        <p>Your recurring transaction titled <strong>%s</strong> for <strong>%s</strong> (%s)</p>
        <p>was originally scheduled on <strong>%s</strong>, and was processed on <strong>%s</strong>.</p>
        <p>Best regards,<br/>Team BudgetIQ</p>
        """,
                userName,
                txn.getTitle(),
                String.format("%.2f", txn.getAmount()),
                txn.getType().name(),
                formattedScheduledDate,
                formattedPostedDate
        );

        CompletableFuture.runAsync(() ->
                emailService.sendDynamicNotification(email, subject, body)
        );
    }
}
