package com.auth.service;

import com.auth.entity.Family;
import com.auth.entity.User;
import com.auth.payload.request.FamilyRequest;
import com.auth.payload.request.SignupRequest;
import com.auth.payload.response.FamilyResponse;
import com.auth.payload.response.FamilySummaryResponse;
import com.auth.serviceImpl.UserDetailsImpl;

public interface FamilyService {
    Family createFamilyByAdmin(User admin, SignupRequest signupRequest) throws Exception;
    User createFamilyUser(SignupRequest signUpRequest) throws Exception;
    public FamilySummaryResponse getFamilySummaryData();
    FamilyResponse getFamilyById(Long id, UserDetailsImpl loggedInUser);
    FamilyResponse updateFamily(Long id, FamilyRequest request, UserDetailsImpl loggedInUser);
    public FamilyResponse getFamilyByUserId(Long userId);
}
