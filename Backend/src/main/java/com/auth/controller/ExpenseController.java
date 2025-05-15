package com.auth.controller;

import com.auth.annotation.CurrentUser;
import com.auth.payload.request.ExpenseRequest;
import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.ExpenseResponse;
import com.auth.service.ExpenseService;
import com.auth.serviceImpl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('MODERATOR')")
public class ExpenseController {
    private final ExpenseService expenseService;

    // Create Expense
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> createExpense(@RequestBody ExpenseRequest request,
                                                                      @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        ExpenseResponse responseBody = expenseService.createExpense(request, userId);
        ApiResponse<ExpenseResponse> response = new ApiResponse<>("Expense created successfully.", responseBody, 200);
        return ResponseEntity.ok(response);
    }

    // List Expenses
    @GetMapping
    public ResponseEntity<ApiResponse<PagedModel<ExpenseResponse>>> getAllExpenses(Pageable pageable,
                                                                                   @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        Page<ExpenseResponse> expenses = expenseService.getAllExpenses(pageable, userId);
        PagedModel<ExpenseResponse> pagedModel = PagedModel.of(expenses.getContent(),
                new PagedModel.PageMetadata(expenses.getSize(), expenses.getNumber(), expenses.getTotalElements()));
        ApiResponse<PagedModel<ExpenseResponse>> response = new ApiResponse<>("Expenses fetched successfully.", pagedModel, 200);
        return ResponseEntity.ok(response);
    }

    // Update Expense
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> updateExpense(@PathVariable Long id,
                                                                      @RequestBody ExpenseRequest request,
                                                                      @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        ExpenseResponse responseBody = expenseService.updateExpense(id, request, userId);
        ApiResponse<ExpenseResponse> response = new ApiResponse<>("Expense updated successfully.", responseBody, 200);
        return ResponseEntity.ok(response);
    }

    // Soft Delete Expense
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteExpense(@PathVariable Long id,
                                                             @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        expenseService.softDeleteExpense(id, userId);
        ApiResponse<String> response = new ApiResponse<>("Expense deleted successfully.", "Expense deleted", 200);
        return ResponseEntity.ok(response);
    }

    // Get Expense History
    @GetMapping("/history/{id}")
    public ResponseEntity<ApiResponse<ExpenseResponse>> getExpenseHistory(@PathVariable Long id) {
        ExpenseResponse responseBody = expenseService.getExpenseHistory(id);
        ApiResponse<ExpenseResponse> response = new ApiResponse<>("Expense history fetched successfully.", responseBody, 200);
        return ResponseEntity.ok(response);
    }
}
