package com.auth.controller;

import com.auth.annotation.CurrentUser;
import com.auth.entity.User;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.globalException.UnauthorizedAccessException;
import com.auth.globalUtils.AsyncResponseHelper;
import com.auth.globalUtils.SecurityUtil;
import com.auth.payload.request.UpdateUserRequest;
import com.auth.payload.response.ApiResponse;
import com.auth.payload.response.GetAllUsersResponse;
import com.auth.payload.response.GetUserByIdResponse;
import com.auth.payload.response.MessageResponse;
import com.auth.repository.UserRepository;
import com.auth.serviceImpl.UserDetailsImpl;
import com.auth.serviceImpl.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
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
    public ResponseEntity<ApiResponse<GetUserByIdResponse>> getUserById(@PathVariable Long id , @CurrentUser UserDetailsImpl loggedInUser) {
        User user = userService.getUserById(id);

        if (loggedInUser == null || loggedInUser.getId() == null) {
            throw new IllegalStateException("Logged-in user information is missing.");
        }
        Long loggedInUserId = loggedInUser.getId();
        // Fetch login user from DB
        User loginUser = userRepository.findById(loggedInUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get user's timezone
        String loginUserTimeZoneString = loginUser.getTimezone() != null
                ? loginUser.getTimezone().getTimezone()
                : "UTC";

        ZoneId loginUserZoneId = ZoneId.of(loginUserTimeZoneString);

        GetUserByIdResponse responsePayload = new GetUserByIdResponse(user, loginUserZoneId);
        ApiResponse<GetUserByIdResponse> response = new ApiResponse<>(
                "User retrieved successfully",
                responsePayload,
                HttpStatus.OK.value()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/getAllUsers")
    @PreAuthorize("hasRole('ADMIN')")
    public CompletableFuture<ResponseEntity<ApiResponse<GetAllUsersResponse>>> getAllUsers(
            @CurrentUser UserDetailsImpl loggedInUser
//            ,@RequestParam(name = "page", defaultValue = "0") int page,
//            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        if (loggedInUser == null || loggedInUser.getId() == null) {
            throw new IllegalStateException("Logged-in user information is missing.");
        }

        Long loggedInUserId = loggedInUser.getId(); // get the id from user details
        return AsyncResponseHelper.wrapAsync(
                () -> userService.getAllUsersAsync(loggedInUserId),
                "Users retrieved successfully",
                "Error retrieving users"
        );
    }


    @GetMapping("/mod/getAllUsers")
    @PreAuthorize("hasRole('MODERATOR')")
    public CompletableFuture<ResponseEntity<ApiResponse<GetAllUsersResponse>>> getAllUsersByModerator(
            @CurrentUser UserDetailsImpl loggedInUser) {

        if (loggedInUser == null || loggedInUser.getId() == null) {
            throw new IllegalStateException("Logged-in user information is missing.");
        }

        Long loggedInUserId = loggedInUser.getId();

        return AsyncResponseHelper.wrapAsync(
                () -> userService.getAllUsersByModerator(loggedInUserId),
                "Users retrieved successfully",
                "Error retrieving users"
        );
    }

    @PutMapping("/update/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('USER') or hasRole('MODERATOR')")
    public CompletableFuture<ResponseEntity<ApiResponse<MessageResponse>>> updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateUserRequest updateUserRequest,
            @CurrentUser UserDetailsImpl loggedInUser) {

        return AsyncResponseHelper.wrap(
                () -> {
                    log.info("Updating user with ID: {} by updater ID: {}", userId, loggedInUser.getId());

                    // Check if user exists
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));


                    // Perform the update logic
                    userService.updateUser(userId, updateUserRequest, loggedInUser.getId());

                    // Create success message response
                    MessageResponse messageResponse = new MessageResponse("User updated successfully");

                    // Wrap the response in an ApiResponse
                    ApiResponse<MessageResponse> apiResponse = new ApiResponse<>(
                            "User updated successfully",
                            messageResponse,
                            HttpStatus.OK.value()
                    );

                    return apiResponse;
                },
                "User updated successfully",
                "Error updating user"
        );
    }
}
