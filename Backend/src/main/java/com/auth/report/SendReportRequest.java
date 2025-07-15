package com.auth.report;

import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class SendReportRequest {
    private Instant startDate;
    private Instant endDate;
    private List<String> recipientEmails;
}
