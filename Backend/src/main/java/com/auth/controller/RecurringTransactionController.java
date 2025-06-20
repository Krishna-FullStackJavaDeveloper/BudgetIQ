package com.auth.controller;

import com.auth.annotation.CurrentUser;
import com.auth.payload.request.RecurringTransactionRequest;
import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.RecurringTransactionResponse;
import com.auth.service.RecurringTransactionService;
import com.auth.serviceImpl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedModel;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringTransactionController {
    private final RecurringTransactionService recurringTransactionService;

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> addRecurring(
            @RequestBody RecurringTransactionRequest request,
            @CurrentUser UserDetailsImpl loggedInUser) {

        RecurringTransactionResponse response = recurringTransactionService
                .addRecurringTransaction(request, loggedInUser.getId());

        return ResponseEntity.ok(new ApiResponse<>("Recurring transaction saved", response, 200));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecurringTransactionResponse>> getById(
            @PathVariable UUID id,
            @CurrentUser UserDetailsImpl loggedInUser) {

        RecurringTransactionResponse response = recurringTransactionService.getById(id);

        // Check ownership
        if (!response.getUserId().equals(loggedInUser.getId())) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access denied", null, 403));
        }

        return ResponseEntity.ok(new ApiResponse<>("Recurring transaction fetched", response, 200));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> update(@PathVariable UUID id,
                                                      @RequestBody RecurringTransactionRequest request,
                                                      @CurrentUser UserDetailsImpl loggedInUser) {
        RecurringTransactionResponse response = recurringTransactionService.getById(id);
        if (!response.getUserId().equals(loggedInUser.getId())) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access denied", null, 403));
        }

        recurringTransactionService.updateRecurring(id, request);
        return ResponseEntity.ok(new ApiResponse<>("Recurring transaction updated successfully", null, 200));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable UUID id,
                                                      @CurrentUser UserDetailsImpl loggedInUser) {
        RecurringTransactionResponse response = recurringTransactionService.getById(id);
        if (!response.getUserId().equals(loggedInUser.getId())) {
            return ResponseEntity.status(403).body(new ApiResponse<>("Access denied", null, 403));
        }

        recurringTransactionService.softDelete(id);
        return ResponseEntity.ok(new ApiResponse<>("Recurring transaction deleted successfully", null, 200));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<PagedModel<RecurringTransactionResponse>>> getAllByUser(
            Pageable pageable,
            @CurrentUser UserDetailsImpl loggedInUser) {

        Long userId = loggedInUser.getId();
        Page<RecurringTransactionResponse> pageData = recurringTransactionService.getAllByUserPaged(userId, pageable);

        PagedModel<RecurringTransactionResponse> pagedModel = PagedModel.of(
                pageData.getContent(),
                new PagedModel.PageMetadata(
                        pageData.getSize(),
                        pageData.getNumber(),
                        pageData.getTotalElements(),
                        pageData.getTotalPages()
                )
        );

        return ResponseEntity.ok(new ApiResponse<>("Recurring transactions fetched successfully", pagedModel, 200));
    }


}
