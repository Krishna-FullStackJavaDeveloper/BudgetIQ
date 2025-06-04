package com.auth.controller;


import com.auth.annotation.CurrentUser;
import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.SummaryResponse;
import com.auth.service.SummaryService;
import com.auth.serviceImpl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {
    private final SummaryService summaryService;

    @GetMapping("/getSummary")
    public ResponseEntity<ApiResponse<SummaryResponse>> getMonthlySummary(@CurrentUser UserDetailsImpl loggedInUser) {
        Long userId = loggedInUser.getId();
        SummaryResponse response = summaryService.getMonthlySummary(userId);
        return ResponseEntity.ok(new ApiResponse<>("Get Data successfully", response, 200));
    }
}
