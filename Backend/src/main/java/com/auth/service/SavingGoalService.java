package com.auth.service;

import com.auth.payload.request.GoalTransactionRequest;
import com.auth.payload.request.SavingGoalRequest;
import com.auth.payload.response.GoalTransactionResponse;
import com.auth.payload.response.SavingGoalResponse;

import java.util.List;

public interface SavingGoalService {
    SavingGoalResponse createGoal(SavingGoalRequest request, Long userId);
    GoalTransactionResponse addTransaction(GoalTransactionRequest request, Long userId);
    List<SavingGoalResponse> getAllGoals(Long userId);
    SavingGoalResponse getGoalDetails(Long goalId, Long userId);
}
