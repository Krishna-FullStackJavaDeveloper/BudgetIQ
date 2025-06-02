package com.auth.serviceImpl;

import com.auth.entity.Expense;
import com.auth.entity.User;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.payload.request.ExpenseRequest;
import com.auth.payload.response.ExpenseResponse;
import com.auth.repository.ExpenseRepository;
import com.auth.repository.UserRepository;
import com.auth.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    @Override
    public ExpenseResponse createExpense(ExpenseRequest request, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Expense expense = Expense.builder()
                .category(request.getCategory())
                .amount(request.getAmount())
                .date(request.getDate())
                .createdAt(Instant.now())
                .deleted(false)
                .user(user)
                .build();
        expenseRepository.save(expense);
        return mapToResponse(expense);
    }

    @Override
    public Page<ExpenseResponse> getAllExpenses(Pageable pageable, Long userId, Integer month, Integer year) {
        User user = userRepository.findById(userId).orElseThrow();
        return expenseRepository.findByUserAndDateMonthYear(user, month, year, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public ExpenseResponse updateExpense(Long id, ExpenseRequest request, Long userId) {
        Expense expense = expenseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if (!expense.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setDate(request.getDate());
        expense.setUpdatedAt(Instant.now());
        return mapToResponse(expenseRepository.save(expense));
    }

    @Override
    public void softDeleteExpense(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        if (!expense.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        expense.setDeleted(true);
        expense.setUpdatedAt(Instant.now());
        expenseRepository.save(expense);
    }

    @Override
    public ExpenseResponse getExpenseHistory(Long id) {
        Expense expense = expenseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        return mapToResponse(expense);
    }

    public List<ExpenseResponse> getMonthlyExpenses(Long userId, Integer month, Integer year) {
        List<Expense> expenses = expenseRepository.findByUserIdAndMonthAndYear(userId, month, year);
        return expenses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ExpenseResponse mapToResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .category(expense.getCategory())
                .amount(expense.getAmount())
                .date(expense.getDate())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
}
