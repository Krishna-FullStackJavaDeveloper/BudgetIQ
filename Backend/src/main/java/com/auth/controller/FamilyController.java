package com.auth.controller;


import com.auth.annotation.CurrentUser;
import com.auth.payload.request.FamilyRequest;
import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.FamilyResponse;
import com.auth.payload.response.FamilySummaryResponse;
import com.auth.service.FamilyService;
import com.auth.serviceImpl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/families")
@RequiredArgsConstructor
public class FamilyController {

    private final FamilyService familyService;

    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FamilySummaryResponse>> getFamilySummary(@CurrentUser UserDetailsImpl loggedInUser) {
        FamilySummaryResponse summary = familyService.getFamilySummaryData();

        ApiResponse<FamilySummaryResponse> response = new ApiResponse<>(
                "Admin family summary fetched successfully",
                summary,
                200
        );

        return ResponseEntity.ok(response);
    }

    // Get family details by ID (ADMIN and MODERATOR allowed)
    @GetMapping("/{id}")
    @PreAuthorize(" hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FamilyResponse>> getFamilyById(@PathVariable Long id,
                                                                     @CurrentUser UserDetailsImpl loggedInUser) {
        FamilyResponse family = familyService.getFamilyById(id, loggedInUser);

        ApiResponse<FamilyResponse> response = new ApiResponse<>(
                "Family details fetched successfully",
                family,
                200);

        return ResponseEntity.ok(response);
    }

    // Update family by ID (ADMIN only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MODERATOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FamilyResponse>> updateFamily(@PathVariable Long id,
                                                                    @RequestBody FamilyRequest request,
                                                                    @CurrentUser UserDetailsImpl loggedInUser) {
        FamilyResponse updatedFamily = familyService.updateFamily(id, request, loggedInUser);

        ApiResponse<FamilyResponse> response = new ApiResponse<>(
                "Family updated successfully",
                updatedFamily,
                200);

        return ResponseEntity.ok(response);
    }

    // ✅ Get families by moderator ID (i.e., current logged-in user only)
    @GetMapping("/my-family")
    @PreAuthorize("hasRole('MODERATOR')  or hasRole('USER')")
    public ResponseEntity<ApiResponse<FamilyResponse>> getFamiliesByModerator(
            @CurrentUser UserDetailsImpl loggedInUser) {

        FamilyResponse family = familyService.getFamilyByUserId(loggedInUser.getId());

        ApiResponse<FamilyResponse> response = new ApiResponse<>(
                "Family fetched successfully",
                family,
                200
        );

        return ResponseEntity.ok(response);
    }
}
