package com.auth.service;

import com.auth.entity.User;
import com.auth.report.FinancialReportDto;

import java.time.Instant;
import java.time.ZoneId;

public interface ReportDataService {
    FinancialReportDto generateTransactionReport(User user, Instant startDate, Instant endDate, ZoneId zoneId);
}
