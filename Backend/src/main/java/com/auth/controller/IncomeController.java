package com.auth.controller;

import com.auth.annotation.CurrentUser;
import com.auth.payload.request.IncomeRequest;
import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.IncomeResponse;
import com.auth.service.IncomeService;
import com.auth.serviceImpl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incomes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('MODERATOR')")
public class IncomeController {
    private final IncomeService incomeService;

    @PostMapping
    public ResponseEntity<ApiResponse<IncomeResponse>> createIncome(@RequestBody IncomeRequest request,
                                                                    @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        IncomeResponse response = incomeService.createIncome(request, userId);
        return ResponseEntity.ok(new ApiResponse<>("Income created successfully", response, 200));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedModel<IncomeResponse>>> getAllIncomes(Pageable pageable,
                                                                                 @RequestParam(required = false) Integer month,
                                                                                 @RequestParam(required = false) Integer year,
                                                                                 @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        Page<IncomeResponse> incomes = incomeService.getAllIncomes(pageable, userId , month, year);
        PagedModel<IncomeResponse> pagedModel = PagedModel.of(incomes.getContent(),
                new PagedModel.PageMetadata(incomes.getSize(), incomes.getNumber(), incomes.getTotalElements()));
        return ResponseEntity.ok(new ApiResponse<>("Incomes fetched successfully", pagedModel, 200));
    }

    //Get monthly incomes
    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<IncomeResponse>>> getMonthlyIncome(
            @RequestParam Integer month,
            @RequestParam Integer year,
            @CurrentUser UserDetailsImpl loggedInUser) {

        Long userId = loggedInUser.getId();
        List<IncomeResponse> incomes = incomeService.getMonthlyIncomes(userId, month, year);

        ApiResponse<List<IncomeResponse>> response = new ApiResponse<>("Monthly expenses fetched successfully.", incomes, 200);
        return ResponseEntity.ok(response);
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> updateIncome(@PathVariable Long id,
                                                                    @RequestBody IncomeRequest request,
                                                                    @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        IncomeResponse updated = incomeService.updateIncome(id, request, userId);
        return ResponseEntity.ok(new ApiResponse<>("Income updated successfully", updated, 200));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteIncome(@PathVariable Long id,
                                                            @CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        incomeService.softDeleteIncome(id, userId);
        return ResponseEntity.ok(new ApiResponse<>("Income deleted successfully", "Income deleted", 200));
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<ApiResponse<IncomeResponse>> getIncomeHistory(@PathVariable Long id) {
        IncomeResponse incomeResponse = incomeService.getIncomeHistory(id);
        return ResponseEntity.ok(new ApiResponse<>("Income history fetched successfully", incomeResponse, 200));
    }
}
