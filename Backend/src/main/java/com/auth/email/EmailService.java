package com.auth.email;

import jakarta.annotation.PreDestroy;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.ZonedDateTime;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.HashMap;
import java.util.Map;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender emailSender;
    private final EmailTemplateService emailTemplateService;

    @Value("${spring.mail.username}") // Fetch sender email from properties
    private String senderEmail;

    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    public void sendLoginNotification(String recipientEmail,  String userName, String action) {

        executorService.submit(() -> {
            SimpleMailMessage message = new SimpleMailMessage();

            // Load templates lazily
            emailTemplateService.loadTemplates("notification-email-templates.properties");
            // Get subject
            String subject = emailTemplateService.getSubject("email." +action);

            // Format the date and time
            ZonedDateTime now = ZonedDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy, EEEE | h:mm a", Locale.ENGLISH);
            String formattedTime = "Today (" + now.format(formatter) + ")";

            // Prepare dynamic placeholders
            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("name", userName);
            placeholders.put("formatted_time", formattedTime);

            // Get formatted body with dynamic values
            String body = emailTemplateService.getFormattedBody("email." +action, placeholders);

            // Set email details
            message.setFrom("Art Asylum <" + senderEmail + ">");
            message.setReplyTo("no-reply@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body);

            try {
                // Send the email
                emailSender.send(message);
                log.info("Notification email sent to {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send notification email to {}: {}", recipientEmail, e.getMessage());
            }
        });
    }

    public void sendOTPNotification(String recipientEmail,  String userName, String action,String otpCode) {

        executorService.submit(() -> {
            SimpleMailMessage message = new SimpleMailMessage();

            // Load templates lazily
            emailTemplateService.loadTemplates("notification-email-templates.properties");
            // Get subject
            String subject = emailTemplateService.getSubject("email." +action);

            // Format the date and time
            ZonedDateTime now = ZonedDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy, EEEE | h:mm a", Locale.ENGLISH);
            String formattedTime = "Today (" + now.format(formatter) + ")";

            // Prepare dynamic placeholders
            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("name", userName);
            placeholders.put("otp", otpCode);

            placeholders.put("formatted_time", formattedTime);

            // Get formatted body with dynamic values
            String body = emailTemplateService.getFormattedBody("email." +action, placeholders);

            // Set email details
            message.setFrom("Art Asylum <" + senderEmail + ">");
            message.setReplyTo("no-reply@gmail.com");
            message.setTo(recipientEmail);
            message.setSubject(subject);
            message.setText(body);

            try {
                // Send the email
                emailSender.send(message);
                log.info("OTP email sent to {}", recipientEmail);
            } catch (Exception e) {
                log.error("Failed to send OTP email to {}: {}", recipientEmail, e.getMessage());
            }
        });
    }

    public void sendPasswordResetEmail(String recipientEmail, String userName, String token) {
        executorService.submit(() -> {
            try {
                MimeMessage message = emailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

                // Email subject
                String subject = "Reset Your Password";

                // Password Reset Link
                String resetLink = "http://localhost:3000/reset-password?token=" + token;

                // HTML email body
                String body = "<p>Hello <strong>" + userName + "</strong>,</p>"
                        + "<p>We received a request to reset your password.</p>"
                        + "<p>Click the link below to set a new password:</p>"
                        + "<p><a href='" + resetLink + "' style='color: blue; font-weight: bold;'>Reset Password</a></p>"
                        + "<p>Or use this token to reset your password: <strong style='font-size: 12px; color: black;'>"
                        + token + "</strong></p>"
                        + "<p>If you didn't request this, ignore this email.</p>"
                        + "<p>Best Regards,<br>Krishna & Team</p>";

                // Set email details
                helper.setFrom("Art Asylum <" + senderEmail + ">");
                helper.setReplyTo("no-reply@gmail.com");
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText(body, true); // Enable HTML

                // Send email
                emailSender.send(message);
                log.info("Password reset email sent to {}", recipientEmail);
            } catch (MessagingException e) {
                log.error("Failed to send password reset email to {}: {}", recipientEmail, e.getMessage());
            }
        });
    }

    @PreDestroy
    public void shutdown() {
        executorService.shutdown();
    }
}
