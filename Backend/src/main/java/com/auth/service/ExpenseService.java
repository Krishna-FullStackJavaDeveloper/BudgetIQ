package com.auth.service;

import com.auth.payload.request.ExpenseRequest;
import com.auth.payload.response.ExpenseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExpenseService {
    ExpenseResponse createExpense(ExpenseRequest request, Long userId);
    Page<ExpenseResponse> getAllExpenses(Pageable pageable, Long userId);
    ExpenseResponse updateExpense(Long id, ExpenseRequest request, Long userId);
    void softDeleteExpense(Long id, Long userId);
    ExpenseResponse getExpenseHistory(Long id);
}
