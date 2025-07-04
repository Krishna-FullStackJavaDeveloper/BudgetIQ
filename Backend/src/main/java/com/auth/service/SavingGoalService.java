package com.auth.service;

import com.auth.payload.request.GoalSearchFilter;
import com.auth.payload.request.GoalTransactionRequest;
import com.auth.payload.request.SavingGoalRequest;
import com.auth.payload.response.GoalTransactionResponse;
import com.auth.payload.response.MonthlyProgressResponse;
import com.auth.payload.response.SavingGoalResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface SavingGoalService {
    SavingGoalResponse createGoal(SavingGoalRequest request, Long userId);

    GoalTransactionResponse addTransaction(GoalTransactionRequest request, Long userId);

    List<SavingGoalResponse> getAllGoals(Long userId);

    SavingGoalResponse getGoalDetails(Long goalId, Long userId);

    Page<SavingGoalResponse> searchGoals(Long userId, GoalSearchFilter filter);

    SavingGoalResponse updateGoal(Long goalId, Long userId, SavingGoalRequest request);

    void softDelete(Long goalId, Long userId);

    List<MonthlyProgressResponse> getMonthlyProgress(Long goalId, Long userId);

    List<GoalTransactionResponse> getTransactionsByGoalId(Long goalId, Long userId);

    GoalTransactionResponse updateTransaction(Long transactionId, GoalTransactionRequest request, Long userId);

    void deleteTransaction(Long transactionId, Long userId);
}
