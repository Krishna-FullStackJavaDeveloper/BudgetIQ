package com.auth.service;

import com.auth.payload.response.SummaryResponse;

public interface SummaryService {
    SummaryResponse getMonthlySummary(Long userId);
}
