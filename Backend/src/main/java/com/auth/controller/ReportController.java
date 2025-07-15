package com.auth.controller;

import com.auth.annotation.CurrentUser;
import com.auth.email.EmailService;
import com.auth.entity.User;
import com.auth.globalUtils.TimezoneUtil;
import com.auth.payload.response.ApiResponse;
import com.auth.report.FinancialReportDto;
import com.auth.report.SendReportRequest;
import com.auth.repository.UserRepository;
import com.auth.service.ExpenseService;
import com.auth.service.IncomeService;
import com.auth.service.ReportDataService;
import com.auth.serviceImpl.PdfReportService;
import com.auth.serviceImpl.ReportService;
import com.auth.serviceImpl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('MODERATOR')")
@Slf4j
public class ReportController {

    private final IncomeService incomeService;
    private final ExpenseService expenseService;
    private final PdfReportService pdfReportService;
    private final UserRepository userRepository;
    private final ReportService reportService;
    private final ReportDataService reportDataService;
    private final EmailService emailService;

    @GetMapping("/download")
    public ResponseEntity<?> downloadPdfReport(@RequestParam Instant startDate,
                                               @RequestParam Instant endDate,
                                               @CurrentUser UserDetailsImpl loggedInUser,
                                               HttpServletResponse response) throws IOException {

        Long userId = loggedInUser.getId();
        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null || !user.getId().equals(userId)) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access denied", null, 403));
        }

        ZoneId userZone = TimezoneUtil.getUserZone(user);
        var incomes = incomeService.getIncomeBetween(userId, startDate, endDate);
        var expenses = expenseService.getExpenseBetween(userId, startDate, endDate);

        FinancialReportDto reportDto = reportService.mapToReportDto(user, incomes, expenses, userZone, startDate, endDate);
        byte[] pdf = pdfReportService.generateFinancialReportPdf(reportDto, userZone);

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=BudgetIQ_Report.pdf");
        response.getOutputStream().write(pdf);

        return null; // PDF is streamed directly, so no need to return ResponseEntity
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<FinancialReportDto>> getReportSummary(@RequestParam Instant startDate,
                                                                            @RequestParam Instant endDate,
                                                                            @CurrentUser UserDetailsImpl loggedInUser) {

        Long userId = loggedInUser.getId();
        User user = userRepository.findById(userId).orElse(null);

        if (user == null || !user.getId().equals(userId)) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access denied", null, 403));
        }

        ZoneId userZone = TimezoneUtil.getUserZone(user);

        var incomes = incomeService.getIncomeBetween(userId, startDate, endDate);
        var expenses = expenseService.getExpenseBetween(userId, startDate, endDate);

        FinancialReportDto reportDto = reportService.mapToReportDto(user, incomes, expenses, userZone, startDate, endDate);

        ApiResponse<FinancialReportDto> response = new ApiResponse<>("Report summary fetched successfully.", reportDto, 200);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<FinancialReportDto>> getAllTransactionsBetween(
            @RequestParam Instant startDate,
            @RequestParam Instant endDate,
            @CurrentUser UserDetailsImpl loggedInUser) {

        Long userId = loggedInUser.getId();
        User user = userRepository.findById(userId).orElse(null);

        if (user == null || !user.getId().equals(userId)) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access denied", null, 403));
        }

        ZoneId userZone = TimezoneUtil.getUserZone(user);
        FinancialReportDto report = reportDataService.generateTransactionReport(user, startDate, endDate, userZone);

        return ResponseEntity.ok(new ApiResponse<>("Fetched income and expenses by date range", report, 200));
    }

    @PostMapping("/send-to-family")
    public ResponseEntity<ApiResponse<String>> sendMonthlyReportToFamily(
            @RequestBody SendReportRequest request,
            @CurrentUser UserDetailsImpl loggedInUser) throws IOException {

        User user = userRepository.findById(loggedInUser.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access denied", null, 403));
        }

        ZoneId userZone = TimezoneUtil.getUserZone(user);
        var incomes = incomeService.getIncomeBetween(user.getId(), request.getStartDate(), request.getEndDate());
        var expenses = expenseService.getExpenseBetween(user.getId(), request.getStartDate(), request.getEndDate());

        FinancialReportDto reportDto = reportService.mapToReportDto(user, incomes, expenses, userZone, request.getStartDate(), request.getEndDate());
        byte[] pdfBytes = pdfReportService.generateFinancialReportPdf(reportDto, userZone);

        // Loop through each selected email and send the PDF report
        request.getRecipientEmails().forEach(email -> {
            Map<String, String> placeholders = new HashMap<>();
            // Use recipient's name from email prefix
            User recipientUser = userRepository.findByEmail(email).orElse(null);
            String recipientName = recipientUser != null ? recipientUser.getFullName() : email.split("@")[0];

            // Use logged-in user's full name as sender
            String senderName = user.getFullName();

            placeholders.put("name", recipientName);
            placeholders.put("senderName", senderName);  // ✅ Now senderName will be correctly inserted
            emailService.sendAttachment(
                    email,
                    "monthly-report-family", // maps to `email.monthly-report.subject` and `.body`
                    placeholders,
                    pdfBytes,
                    "BudgetIQ_Monthly_Report.pdf"
            );
        });

        return ResponseEntity.ok(new ApiResponse<>("Report sent to selected family members successfully", null, 200));
    }

}
