package com.auth.service;

import com.auth.entity.Income;
import com.auth.payload.request.IncomeRequest;
import com.auth.payload.response.ExpenseResponse;
import com.auth.payload.response.IncomeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

public interface IncomeService {
    IncomeResponse createIncome(IncomeRequest request, Long userId);
    Page<IncomeResponse> getAllIncomes(Pageable pageable, Long userId, Integer month, Integer year);
    IncomeResponse updateIncome(Long id, IncomeRequest request, Long userId);
    void softDeleteIncome(Long id, Long userId);
    IncomeResponse getIncomeHistory(Long id);
    List<IncomeResponse> getMonthlyIncomes(Long userId, Integer month, Integer year);
    List<Income> getIncomeBetween(Long userId, Instant start, Instant end);
}
