package com.auth.controller;

import com.auth.entity.User;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.payload.request.UpdateUserRequest;
import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.GetAllUsersResponse;
import com.auth.payload.response.GetUserByIdResponse;
import com.auth.payload.response.MessageResponse;
import com.auth.repository.UserRepository;
import com.auth.serviceImpl.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@RestControllerAdvice(basePackages = "com.auth")
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/user/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<GetUserByIdResponse>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        GetUserByIdResponse responsePayload = new GetUserByIdResponse(user);
        ApiResponse<GetUserByIdResponse> response = new ApiResponse<>(
                "User retrieved successfully",
                responsePayload,
                HttpStatus.OK.value()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/getAllUsers")
    @PreAuthorize("hasRole('ADMIN')")
    public CompletableFuture<ResponseEntity<ApiResponse<GetAllUsersResponse>>> getAllUsers() {
        return userService.getAllUsersAsync()
                .thenApply(responsePayload -> ResponseEntity.ok(
                        new ApiResponse<>("Users retrieved successfully", responsePayload, HttpStatus.OK.value())
                ))
                .exceptionally(ex -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ApiResponse<>("Error retrieving users", null, HttpStatus.INTERNAL_SERVER_ERROR.value())));
    }

    @GetMapping("/mod/getAllUsers/{userId}")
    @PreAuthorize("hasRole('MODERATOR')")
    public ResponseEntity<ApiResponse<GetAllUsersResponse>> getAllUsersByModerator(@PathVariable Long userId) {
        GetAllUsersResponse responsePayload = userService.getAllUsersByModerator(userId);
        ApiResponse<GetAllUsersResponse> response = new ApiResponse<>(
                "Users retrieved successfully",
                responsePayload,
                HttpStatus.OK.value()
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('MODERATOR')")
    public CompletableFuture<ResponseEntity<ApiResponse<MessageResponse>>> updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateUserRequest updateUserRequest,
            @RequestParam Long updatedById) {

        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Updating user with ID: {} by updater ID: {}", userId, updatedById);

                // Check if user exists
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("user", "id" , userId));

                // Perform the update logic
                userService.updateUser(userId, updateUserRequest, updatedById);

                // Create success message response
                MessageResponse messageResponse = new MessageResponse("User updated successfully");

                // Wrap the response in an ApiResponse
                ApiResponse<MessageResponse> apiResponse = new ApiResponse<>(
                        "User updated successfully",
                        messageResponse,
                        HttpStatus.OK.value()
                );

                // Return the response wrapped in ResponseEntity
                return ResponseEntity.ok(apiResponse);
            } catch (Exception e) {
                log.error("Error updating user with ID: {}", userId, e);
                ApiResponse<MessageResponse> errorResponse = new ApiResponse<>(
                        "Error updating user: " + e.getMessage(),
                        null,
                        HttpStatus.INTERNAL_SERVER_ERROR.value()
                );
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        });
    }
}
