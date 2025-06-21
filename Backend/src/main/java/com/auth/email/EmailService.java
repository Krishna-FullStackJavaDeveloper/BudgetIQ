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

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.HashMap;
import java.util.Map;

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
            String subject = emailTemplateService.getSubject("email." + action);

            // Prepare dynamic placeholders
            Map<String, String> placeholders = new HashMap<>();
            placeholders.put("name", userName);

            // Get formatted body with dynamic values
            String body = emailTemplateService.getFormattedBody("email." + action, placeholders);

            // Set email details
            message.setFrom("BudgetIQ <" + senderEmail + ">"); // Updated to BudgetIQ
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

    public void sendOTPNotification(String recipientEmail, String userName, String action, String otpCode) {
        executorService.submit(() -> {
            try {
                // Load templates lazily
                emailTemplateService.loadTemplates("notification-email-templates.properties");

                // Get subject
                String subject = emailTemplateService.getSubject("email." + action);

                // Prepare dynamic placeholders
                Map<String, String> placeholders = new HashMap<>();
                placeholders.put("name", userName);
                placeholders.put("otp", otpCode);

                // Build the HTML body manually (instead of getting from templates)
                String body = "<td align=\"left\" valign=\"top\" style=\"padding:25px 0px 0px\">" +
                        "<h2 style=\"font-family:'Noto IKEA','Noto Sans','Helvetica Neue',Arial,sans-serif;" +
                        "font-weight:bold;font-size:30px;line-height:40px;color:#111;margin:0 0 25px;padding:0\">Hi " + userName + "!</h2>" +
                        "<div style=\"font-family:'Noto IKEA','Noto Sans','Helvetica Neue',Arial,sans-serif;" +
                        "font-weight:normal;font-size:14px;line-height:18px;color:#111;margin:0;padding:0\">" +
                        "<p style=\"margin:0 0 25px\">Enter these 6 digits where you requested your one-time code:</p>" +
                        "<p style=\"font-size:48px\"><b>" + otpCode + "</b></p>" +
                        "<p style=\"margin:0 0 25px\">Please don't share your one-time code. This one-time code remains valid for 5 minutes only.</p>" +
                        "<p>Sincerely,<br/>Team BudgetIQ</p>" +
                        "</div></td>";

                // Create MimeMessage for HTML email
                MimeMessage mimeMessage = emailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                helper.setFrom("BudgetIQ <" + senderEmail + ">");
                helper.setReplyTo("no-reply@gmail.com");
                helper.setTo(recipientEmail);
                helper.setSubject(subject);
                helper.setText("<html><body><table>" + body + "</table></body></html>", true); // Set 'true' for HTML content

                // Send the email
                emailSender.send(mimeMessage);
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
                        + "<p>Best Regards,<br>Team BudgetIQ </p>";

                // Set email details
                helper.setFrom("BudgetIQ <" + senderEmail + ">");
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


    public void sendDynamicNotification(String recipientEmail, String userSubject, String htmlBody) {
        executorService.submit(() -> {
            try {
                emailTemplateService.loadTemplates("notification-email-templates.properties");

                MimeMessage message = emailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true); // true = multipart

                helper.setFrom("BudgetIQ <" + senderEmail + ">");
                helper.setTo(recipientEmail);
                helper.setReplyTo("no-reply@gmail.com");
                helper.setSubject(userSubject);
                helper.setText(htmlBody, true); // ✅ Send as HTML

                emailSender.send(message);
                log.info("Recurring transaction notification sent to {}", recipientEmail);

            } catch (Exception e) {
                log.error("Failed to send recurring transaction notification to {}: {}", recipientEmail, e.getMessage());
            }
        });
    }

    @PreDestroy
    public void shutdown() {
        executorService.shutdown();
    }
}
