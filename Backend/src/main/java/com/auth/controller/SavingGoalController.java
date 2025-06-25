package com.auth.controller;

import com.auth.annotation.CurrentUser;
import com.auth.payload.request.GoalSearchFilter;
import com.auth.payload.request.GoalTransactionRequest;
import com.auth.payload.response.GoalTransactionResponse;
import com.auth.payload.response.MonthlyProgressResponse;
import com.auth.payload.response.SavingGoalResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<SavingGoalResponse>> updateGoal(
            @PathVariable Long id,
            @RequestBody SavingGoalRequest request,
            @CurrentUser UserDetailsImpl user
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>("Goal updated", savingGoalService.updateGoal(id, user.getId(), request), 200)
        );
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<String>> softDeleteGoal(
            @PathVariable Long id,
            @CurrentUser UserDetailsImpl user
    ) {
        savingGoalService.softDelete(id, user.getId());
        return ResponseEntity.ok(new ApiResponse<>("Goal deleted", "Deleted", 200));
    }

    @GetMapping("/{goalId}/monthly-progress")
    public ResponseEntity<ApiResponse<List<MonthlyProgressResponse>>> getMonthlyProgress(
            @PathVariable Long goalId,
            @CurrentUser UserDetailsImpl user
    ) {
        return ResponseEntity.ok(new ApiResponse<>(
                "Monthly progress", savingGoalService.getMonthlyProgress(goalId, user.getId()), 200
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<SavingGoalResponse>>> searchGoals(
            GoalSearchFilter filter,
            @CurrentUser UserDetailsImpl user
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>("Goals fetched", savingGoalService.searchGoals(user.getId(), filter), 200)
        );
    }
}
