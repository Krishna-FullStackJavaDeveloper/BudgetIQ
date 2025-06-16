package com.auth.controller;

import com.auth.eNum.AccountStatus;
import com.auth.eNum.ERole;
import com.auth.entity.Family;
import com.auth.entity.User;
import com.auth.jwt.AuthTokenFilter;
import com.auth.jwt.JwtUtils;
import com.auth.payload.request.LoginRequest;
import com.auth.payload.request.OTPVerificationRequest;
import com.auth.payload.request.SignupRequest;
import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.JwtResponse;
import com.auth.repository.UserRepository;
import com.auth.email.EmailService;
import com.auth.service.FamilyService;
import com.auth.serviceImpl.*;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final AuthTokenFilter authTokenFilter;
    private final OTPService otpService;
    private final UserDetailsServiceImpl userDetailsService;
    private final FamilyService familyService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        log.debug("User login attempt for username or email: {}", loginRequest.getUsername());

        // Determine if the loginRequest contains an email or a username, and fetch the user accordingly.
        User user;
        if (loginRequest.getUsername().contains("@")) {
            user = userRepository.findByEmail(loginRequest.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        } else {
            user = userRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Check if the account status is ACTIVE
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            // Return an error response if the account is not ACTIVE
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>("Account is not active. Please contact support.", null, HttpStatus.FORBIDDEN.value()));
        }

        if (user.isTwoFactorEnabled()) {
            // If 2FA is enabled, generate and send OTP
            otpService.generateOTP(user); //otp is generated and saved.
            return ResponseEntity.ok(new ApiResponse<>("OTP sent to your email", null, HttpStatus.ACCEPTED.value()));
        }

        List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

            String accessToken = jwtUtils.generateJwtToken(authentication);
            String refreshToken = refreshTokenService.createRefreshToken(userDetails.getUser());
            log.info("Generated refresh token: {}", refreshToken);

        // Send login notification email asynchronously (to improve response time)
            CompletableFuture.runAsync(() -> emailService.sendLoginNotification(userDetails.getEmail(), userDetails.getUsername(),"login"));
            log.info("User {} logged in successfully", loginRequest.getUsername());
        // Update the last login timestamp for the user
        user.setLastLogin(Instant.now()); // Set the current timestamp
        userRepository.save(user); // Save the updated user to persist the last login time

            return ResponseEntity.ok(new ApiResponse<>("Login successful",
                    new JwtResponse(accessToken,
                            userDetails.getId(),
                            userDetails.getUsername(),
                            userDetails.getEmail(),
                            roles,
                            refreshToken),
                    HttpStatus.OK.value()
            ));// Include the refresh token in the response

    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<JwtResponse>> verifyOtpAndLogin(
            @Valid @RequestBody OTPVerificationRequest otpRequest) {

        log.debug("Verifying user OTP attempt for username: {}", otpRequest.getUsername());

        User user = userRepository.findByUsername(otpRequest.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        boolean isOtpValid = otpService.verifyOTP(user, otpRequest.getOtp());

        if (!isOtpValid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>("Invalid or expired OTP", null, HttpStatus.UNAUTHORIZED.value()));
        }

        // Load user details
        UserDetailsImpl userDetails = (UserDetailsImpl) userDetailsService.loadUserByUsername(otpRequest.getUsername());

        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Generate JWT tokens using JwtUtils
        String accessToken = jwtUtils.generateJwtToken(new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
        String refreshToken = refreshTokenService.createRefreshToken(userDetails.getUser());
        log.info("Generated refresh token after OTP Creation: {}", refreshToken);

        // Send login notification email asynchronously (to improve response time)
        CompletableFuture.runAsync(() -> emailService.sendLoginNotification(userDetails.getEmail(), userDetails.getUsername(),"login"));
        log.info("User {} logged in successfully!", otpRequest.getUsername());
        // Update the last login timestamp for the user
        user.setLastLogin(Instant.now()); // Set the current timestamp
        userRepository.save(user); // Save the updated user to persist the last login time

        return ResponseEntity.ok(new ApiResponse<>("Login successful",
                new JwtResponse(accessToken,
                        userDetails.getId(),
                        userDetails.getUsername(),
                        userDetails.getEmail(),
                        roles,
                        refreshToken),
                HttpStatus.OK.value()
        ));// Include the refresh token in the response
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {

            if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity
                        .badRequest()
                        .body(new ApiResponse<>("Error: Username is already taken!", null, HttpStatus.BAD_REQUEST.value()));
            }

            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(new ApiResponse<>("Error: Email is already in use!", null, HttpStatus.BAD_REQUEST.value()));
            }

        try {
                User user = userDetailsService.createNewUser(signUpRequest);

                // Handle the case where the user is a moderator
                if (signUpRequest.getRole().contains("mod")) {

                    if (signUpRequest.getFamilyName() == null || signUpRequest.getFamilyName().isEmpty()) {
                        return ResponseEntity.badRequest()
                                .body(new ApiResponse<>("Error: Family name is required for moderators.", null, HttpStatus.BAD_REQUEST.value()));
                    }
                    try {
                        Family createdFamily = familyService.createFamilyByAdmin(user, signUpRequest);
                        user.setFamily(createdFamily);

                    } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                .body(new ApiResponse<>(e.getMessage(), null, HttpStatus.BAD_REQUEST.value()));
                    }
                }
                // Handle the case where the user is a regular user
                if ((signUpRequest.getRole().contains("user") || signUpRequest.getRole().contains("USER") || signUpRequest.getRole().equals(ERole.ROLE_USER)) && signUpRequest.getFamilyName() != null) {
                    if(signUpRequest.getPasskey() == null || signUpRequest.getPasskey().trim().isEmpty()){
                        return ResponseEntity.badRequest()
                                .body(new ApiResponse<>("Error: Family Password Required.", null, HttpStatus.BAD_REQUEST.value()));
                    }
                    try {
                        familyService.createFamilyUser(signUpRequest);
                        return ResponseEntity.ok(new ApiResponse<>("User registered successfully.", null, HttpStatus.OK.value()));
                    } catch (Exception e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(new ApiResponse<>("Error: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR.value()));
                    }
                }

            // Save the user in the repository if not a moderator or user with family assignment
            userRepository.save(user);
            CompletableFuture.runAsync(() -> emailService.sendLoginNotification(user.getEmail(), user.getFullName(), "register"));
            return ResponseEntity.ok(new ApiResponse<>("User registered successfully!", null, HttpStatus.OK.value()));

        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Error: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    @PostMapping("/refresh")
    public  CompletableFuture<ResponseEntity<ApiResponse<String>>> refreshToken(HttpServletRequest request) {
        String refreshToken = authTokenFilter.parseJwt(request);

        if (!refreshTokenService.validateRefreshToken(refreshToken)) {
            throw new JwtException("Invalid refresh token"); // Let GlobalExceptionHandler handle it
        }

        String username = jwtUtils.getUserNameFromJwtToken(refreshToken);
        Long userId = jwtUtils.getUserIdFromJwtToken(refreshToken);

        return CompletableFuture.supplyAsync(() -> userRepository.findByUsername(username))
                .thenApply(userOptional -> {
                    if (userOptional.isEmpty()) {
                        throw new UsernameNotFoundException("User not found"); // Also handled globally
                    }

                    String newAccessToken = jwtUtils.generateJwtTokenFromUsername(username, userId);
//                    String newRefreshToken = refreshTokenService.createRefreshToken(userDetails.getUser());
//                    String newRefreshToken = jwtUtils.generateRefreshTokenFromUsername(username, userId);
                    return ResponseEntity.ok(
                            new ApiResponse<>("Token refreshed successfully", newAccessToken, HttpStatus.OK.value())
                    );
                });

    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = UUID.randomUUID().toString(); // Generate token
        user.setResetToken(token);
        user.setTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES)); // 30 mins expiry
        userRepository.save(user);

        // Send reset password email asynchronously
        CompletableFuture.runAsync(() -> emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token));

        return ResponseEntity.ok(Map.of(
                "message", "Use this token to reset password",
                "resetToken", token
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || newPassword == null || token.isEmpty() || newPassword.isEmpty()) {
            ApiResponse<Object> errorResponse = new ApiResponse<>("Token and new password are required", null, 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }

        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (user.getTokenExpiry().isBefore(Instant.now())) {
            ApiResponse<Object> errorResponse = new ApiResponse<>("Token expired", null, 400);
            return ResponseEntity.badRequest().body(errorResponse);
        }


        String hashedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(hashedPassword);
        user.setResetToken(null);  // Clear token after reset
        user.setTokenExpiry(null);
        userRepository.save(user);

        // Send reset password email asynchronously
        CompletableFuture.runAsync(() -> emailService.sendLoginNotification(user.getEmail(), user.getUsername(), "resetPassword"));

        ApiResponse<Object> successResponse = new ApiResponse<>("Password reset successful", null, 200);
        return ResponseEntity.ok(successResponse);
    }
}
