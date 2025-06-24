package com.auth.controller;

import com.auth.annotation.CurrentUser;
import com.auth.payload.request.GoalTransactionRequest;
import com.auth.payload.response.GoalTransactionResponse;
import com.auth.payload.response.SavingGoalResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.auth.payload.response.ApiResponse;
import com.auth.service.SavingGoalService;
import com.auth.payload.request.SavingGoalRequest;
import com.auth.serviceImpl.UserDetailsImpl;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class SavingGoalController {
    private final SavingGoalService savingGoalService;

    // Create new saving goal
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<SavingGoalResponse>> createGoal(
            @RequestBody SavingGoalRequest request,
            @CurrentUser UserDetailsImpl currentUser) {

        SavingGoalResponse response = savingGoalService.createGoal(request, currentUser.getId());

        return ResponseEntity.ok(new ApiResponse<>("Goal created successfully", response, 200));
    }

    // Add transaction to goal
    @PostMapping("/add-transaction")
    public ResponseEntity<ApiResponse<GoalTransactionResponse>> addGoalTransaction(
            @RequestBody GoalTransactionRequest request,
            @CurrentUser UserDetailsImpl currentUser) {

        GoalTransactionResponse response = savingGoalService.addTransaction(request, currentUser.getId());

        return ResponseEntity.ok(new ApiResponse<>("Goal transaction added", response, 200));
    }

    // View all goals of user
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<SavingGoalResponse>>> getUserGoals(
            @CurrentUser UserDetailsImpl currentUser) {

        List<SavingGoalResponse> response = savingGoalService.getAllGoals(currentUser.getId());

        return ResponseEntity.ok(new ApiResponse<>("All saving goals", response, 200));
    }

    // Get specific goal details
    @GetMapping("/{goalId}")
    public ResponseEntity<ApiResponse<SavingGoalResponse>> getGoalById(
            @PathVariable Long goalId,
            @CurrentUser UserDetailsImpl currentUser) {

        SavingGoalResponse response = savingGoalService.getGoalDetails(goalId, currentUser.getId());

        return ResponseEntity.ok(new ApiResponse<>("Goal details fetched", response, 200));
    }
}
