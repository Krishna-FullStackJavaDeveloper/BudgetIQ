package com.auth.service;

import com.auth.payload.request.IncomeRequest;
import com.auth.payload.response.IncomeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IncomeService {
    IncomeResponse createIncome(IncomeRequest request, Long userId);
    Page<IncomeResponse> getAllIncomes(Pageable pageable, Long userId);
    IncomeResponse updateIncome(Long id, IncomeRequest request, Long userId);
    void softDeleteIncome(Long id, Long userId);
    IncomeResponse getIncomeHistory(Long id);
}
