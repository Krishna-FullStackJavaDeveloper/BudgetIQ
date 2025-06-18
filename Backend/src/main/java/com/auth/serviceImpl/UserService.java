package com.auth.serviceImpl;

import com.auth.eNum.AccountStatus;
import com.auth.eNum.ERole;
import com.auth.email.EmailService;
import com.auth.entity.Family;
import com.auth.entity.Role;
import com.auth.entity.Timezone;
import com.auth.entity.User;
import com.auth.globalException.DuplicateResourceException;
import com.auth.globalException.InvalidRoleException;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.globalException.UnauthorizedAccessException;
import com.auth.payload.request.UpdateUserRequest;
import com.auth.payload.response.GetAllUsersResponse;
import com.auth.payload.response.MessageResponse;
import com.auth.repository.FamilyRepository;
import com.auth.repository.RoleRepository;
import com.auth.repository.TimezoneRepository;
import com.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final FamilyRepository familyRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TimezoneRepository timezoneRepository;

    @Transactional
    public User getUserById(Long id) {
        // Fetching the user using the repository method
        Optional<User> userOpt = userRepository.findByIdWithRolesAndFamily(id);

        // Handling case if user is not found
        if (userOpt.isEmpty()) {
            throw new ResourceNotFoundException("User", "id", id);
        }

        return userOpt.get();
    }


    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<GetAllUsersResponse> getAllUsersAsync(Long userId) {

        // Fetch login user from DB
        User loginUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get user's timezone
        String loginUserTimeZoneString = loginUser.getTimezone() != null
                ? loginUser.getTimezone().getTimezone()
                : "UTC";

        ZoneId loginUserZoneId = ZoneId.of(loginUserTimeZoneString);

        List<User> allUsers = userRepository.findAllUsers();
        GetAllUsersResponse response = new GetAllUsersResponse(allUsers, loginUserZoneId);
        return CompletableFuture.completedFuture(response);
    }

    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<GetAllUsersResponse> getAllUsersByModerator(Long userId) {
        // Fetch the moderator from DB with roles
        User moderator = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if user has ROLE_MODERATOR
        boolean isModerator = moderator.getRoles().stream()
                .map(Role::getName)  // Role::getName returns ERole
                .anyMatch(roleName -> roleName == ERole.ROLE_MODERATOR);

        ZoneId moderatorZoneId = getZoneId(isModerator, moderator);

        // Fetch all users in the same family
        Long familyId = moderator.getFamily().getId();
        List<User> usersInFamily = userRepository.findAllByFamilyId(familyId);

        // Return response with users and timezone
        GetAllUsersResponse response = new GetAllUsersResponse(usersInFamily, moderatorZoneId);
        return CompletableFuture.completedFuture(response);
    }

    private static ZoneId getZoneId(boolean isModerator, User moderator) {
        if (!isModerator) {
            throw new IllegalArgumentException("User is not a moderator.");
        }

        // Check if the moderator has a family assigned
        if (moderator.getFamily() == null) {
            throw new IllegalArgumentException("Moderator is not assigned to any family.");
        }

        // Get moderator's timezone (default to UTC if null)
        String moderatorTimeZoneString = moderator.getTimezone() != null
                ? moderator.getTimezone().getTimezone()
                : "UTC";

        return ZoneId.of(moderatorTimeZoneString);
    }


    public MessageResponse updateUser(Long id, UpdateUserRequest request, Long loginUser) {
        try {
            log.info("Fetching user with ID: {}", id);
            User userToUpdate = userRepository.findByIdWithRolesAndFamily(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

            User loggedInUser = userRepository.findByIdWithRolesAndFamily(loginUser)
                    .orElseThrow(() -> new ResourceNotFoundException("Logged-in user", "id", loginUser));
            log.debug("Fetched logged-in user: {}", loggedInUser);

            if (!isAuthorizedToUpdate(loggedInUser, userToUpdate)) {
                log.warn("Unauthorized access attempt by user with ID: {} to update user with ID: {}", loginUser, id);
                throw new UnauthorizedAccessException("You are not authorized to update this user's profile.");
            }

            boolean isUser = loggedInUser.getRoles().stream()
                    .anyMatch(role -> role.getName().equals(ERole.ROLE_USER));

            // Prevent users from updating their own role
            if (isUser) {
                Set<String> userRoles = userToUpdate.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet());

                if (request.getRole() != null && !request.getRole().equals(userRoles) && loggedInUser.getId().equals(userToUpdate.getId())) {
                    log.warn("User with ID: {} attempted to change their own role.", loginUser);
                    throw new UnauthorizedAccessException("You are not allowed to change your own role.");
                }
            }

            // Check if username or email already exists before updating
            if (isUsernameTaken(request.getUsername(), userToUpdate) || isEmailTaken(request.getEmail(), userToUpdate)) {
                return new MessageResponse("Username or Email already exists.");
            }

            // Update fields if present
            updateFields(request, userToUpdate);

            // Update roles if provided
            if (request.getRole() != null && !request.getRole().isEmpty()) {
                updateRoles(request, loggedInUser, userToUpdate);
            }

            // Update last modified timestamp and the updater's ID
            userToUpdate.setUpdatedAt(Instant.now().atZone(ZoneOffset.UTC).toInstant());
            userToUpdate.setUpdatedBy(loginUser);

            log.info("Updating user with ID: {}", id);
            userRepository.save(userToUpdate);

            CompletableFuture.runAsync(() -> emailService.sendLoginNotification(userToUpdate.getEmail(), userToUpdate.getUsername(), "update_user"));
            log.info("User with ID: {} updated successfully", id);

            return new MessageResponse("User updated successfully");
        } catch (UnauthorizedAccessException | ResourceNotFoundException ex) {
            log.error("Error occurred", ex);
            throw ex; // Rethrow to let global exception handler handle it
        } catch (Exception e) {
            log.error("Error updating user with ID: {}", id, e);
            throw new RuntimeException(e.getMessage());
//            throw new RuntimeException("Error updating user: " + e.getMessage(), e);
        }
    }

    private boolean isAuthorizedToUpdate(User loggedInUser, User userToUpdate) {
        // Case 1: User can update their own profile
        if (loggedInUser.getId().equals(userToUpdate.getId())) {
            return true;
        }

        // Case 2: User is an admin (assuming you have a ROLE_ADMIN in the system)
        if (loggedInUser.getRoles().stream()
                .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN)) {  // Compare directly with the enum constant
            return true;
        }

        // Case 3: User is a family admin (Family ID check and ROLE_MODERATOR check)
        Family loggedInUserFamily = loggedInUser.getFamily();
        Family userToUpdateFamily = userToUpdate.getFamily();
        if (loggedInUserFamily != null && userToUpdateFamily != null &&
                loggedInUserFamily.getId().equals(userToUpdateFamily.getId())) {
            // Check for the 'ROLE_MODERATOR' using enum comparison
            boolean isModerator = loggedInUser.getRoles().stream()
                    .map(Role::getName)  // Access the enum directly
                    .anyMatch(role -> role == ERole.ROLE_MODERATOR);  // Compare against the enum constant directly

            if (isModerator) {
                log.info("Logged-in user is a moderator.");
                return true;  // User is a moderator
            } else {
                log.info("Logged-in user is NOT a moderator.");
                return false;  // User is not a moderator
            }
        }
        // If none of the above conditions are true, deny access
        return false;
    }

    private boolean isUsernameTaken(String username, User userToUpdate) {
        return username != null && !username.equals(userToUpdate.getUsername()) && userRepository.findByUsername(username).isPresent();
    }

    private boolean isEmailTaken(String email, User userToUpdate) {
        return email != null && !email.equals(userToUpdate.getEmail()) && userRepository.findByEmail(email).isPresent();
    }

    private void updateFields(UpdateUserRequest request, User userToUpdate) {
        if (request.getUsername() != null && !request.getUsername().equals(userToUpdate.getUsername())) {
            userToUpdate.setUsername(request.getUsername());
        }
        if (request.getEmail() != null && !request.getEmail().equals(userToUpdate.getEmail())) {
            userToUpdate.setEmail(request.getEmail());
        }
        if (request.getFullName() != null && !request.getFullName().equals(userToUpdate.getFullName())) {
            userToUpdate.setFullName(request.getFullName());
        }
        if (request.getPassword() != null && !passwordEncoder.matches(request.getPassword(), userToUpdate.getPassword())) {
            userToUpdate.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().equals(userToUpdate.getPhoneNumber())) {
            userToUpdate.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getTwoFactorEnabled() != null && !request.getTwoFactorEnabled().equals(userToUpdate.isTwoFactorEnabled())) {
            userToUpdate.setTwoFactorEnabled(request.getTwoFactorEnabled());
        }
        if (request.getAccountStatus() != null && !request.getAccountStatus().equals(userToUpdate.getAccountStatus())) {

            // Only check if setting status to ACTIVE
            if (request.getAccountStatus() == AccountStatus.ACTIVE) {
                Family family = userToUpdate.getFamily();
                if (family == null) {
                    throw new RuntimeException("User's family is not assigned.");
                }

                // Count active users in the family except current user (if user currently inactive)
                long activeUsersCount = family.getUsers().stream()
                        .filter(user -> user.getAccountStatus() == AccountStatus.ACTIVE)
                        .count();

                // If user currently inactive, activating increases count by 1
                boolean isCurrentlyInactive = userToUpdate.getAccountStatus() != AccountStatus.ACTIVE;

                if (isCurrentlyInactive && activeUsersCount >= 6) {
                    throw new RuntimeException("Family active user limit (6) reached. Cannot activate more users.");
                }
            }

            // If limit not reached or status is not ACTIVE, allow update
            userToUpdate.setAccountStatus(request.getAccountStatus());
        }
        // Update Timezone
        if (request.getTimezone() != null) {
            Timezone timezoneEntity = timezoneRepository.findByTimezone(request.getTimezone())
                    .orElseThrow(() -> new ResourceNotFoundException("Timezone not found"));
            userToUpdate.setTimezone(timezoneEntity);
        }
    }

    private void updateRoles(UpdateUserRequest request, User loggedInUser, User userToUpdate) {
        Set<Role> updatedRoles = new HashSet<>();

        for (String roleName : request.getRole()) {
            Role role = roleRepository.findByName(ERole.valueOf(roleName))
                    .orElseThrow(() -> new InvalidRoleException("Role " + roleName + " does not exist."));
            updatedRoles.add(role);
        }

        boolean isAdmin = loggedInUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals(ERole.ROLE_ADMIN));

        boolean isModerator = loggedInUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals(ERole.ROLE_MODERATOR));

        if (isAdmin) {
            updateAdminRoles(userToUpdate, updatedRoles, loggedInUser);
        } else if (isModerator) {
            updateModeratorRoles(userToUpdate, updatedRoles, loggedInUser);
        }
    }

    private void updateAdminRoles(User userToUpdate, Set<Role> updatedRoles, User loggedInUser) {
        Family family = userToUpdate.getFamily();
        User existingModerator = family.getModerator();

        // Count active users in the family
        List<User> activeUsers = family.getUsers().stream()
                .filter(user -> user.getAccountStatus() == AccountStatus.ACTIVE)
                .toList();

        long activeUsersCount = activeUsers.size();

        boolean currentlyModerator = userToUpdate.getRoles().stream()
                .anyMatch(role -> role.getName().equals(ERole.ROLE_MODERATOR));

        boolean willBeModerator = updatedRoles.stream()
                .anyMatch(role -> role.getName().equals(ERole.ROLE_MODERATOR));

        // Block removing MODERATOR role if user is current mod and no other active users exist
        if (currentlyModerator && !willBeModerator && activeUsersCount <= 1) {
            throw new RuntimeException("Cannot remove moderator role because you are the only active user in your family.");
        }

        // Update roles
        userToUpdate.setRoles(updatedRoles);

        // If assigning moderator role
        if (willBeModerator) {
            if (existingModerator != null && !existingModerator.getId().equals(userToUpdate.getId())) {
                existingModerator.setRoles(new HashSet<>(List.of(
                        roleRepository.findByName(ERole.ROLE_USER).orElseThrow(() ->
                                new RuntimeException("ROLE_USER not found")
                        )
                )));
                existingModerator.setUpdatedBy(loggedInUser.getId());
                userRepository.save(existingModerator);
            }
            family.setModerator(userToUpdate);
            familyRepository.save(family);
        }

        // If removing moderator role
        if (currentlyModerator && !willBeModerator) {
            // Assign moderator to another active user (excluding the one being updated)
            User newModerator = activeUsers.stream()
                    .filter(u -> !u.getId().equals(userToUpdate.getId()))
                    .findFirst()
                    .orElse(null);

            if (newModerator != null) {
                // Assign MODERATOR role to this new user
                Set<Role> newRoles = new HashSet<>(newModerator.getRoles());
                newRoles.add(roleRepository.findByName(ERole.ROLE_MODERATOR)
                        .orElseThrow(() -> new RuntimeException("ROLE_MODERATOR not found")));
                newModerator.setRoles(newRoles);
                newModerator.setUpdatedBy(loggedInUser.getId());
                userRepository.save(newModerator);

                // Set as family moderator
                family.setModerator(newModerator);
                familyRepository.save(family);
            }
        }
    }



    private void updateModeratorRoles(User userToUpdate, Set<Role> updatedRoles, User loggedInUser) {
        if (!loggedInUser.getFamily().getId().equals(userToUpdate.getFamily().getId())) {
            throw new UnauthorizedAccessException("You can only update family members.");
        }

        Family family = loggedInUser.getFamily();

        // Count active users in the family
        List<User> activeUsers = family.getUsers().stream()
                .filter(user -> user.getAccountStatus() == AccountStatus.ACTIVE)
                .toList();

        boolean currentlyModerator = userToUpdate.getRoles().stream()
                .anyMatch(role -> role.getName().equals(ERole.ROLE_MODERATOR));

        boolean willBeModerator = updatedRoles.stream()
                .anyMatch(role -> role.getName().equals(ERole.ROLE_MODERATOR));

        // Prevent removing moderator role if user is the only active user
        if (currentlyModerator && !willBeModerator && activeUsers.size() <= 1) {
            throw new RuntimeException("Cannot remove moderator role because you are the only active user in your family.");
        }

        // Update roles on userToUpdate
        userToUpdate.setRoles(updatedRoles);

        if (willBeModerator) {
            // Assign new moderator and downgrade existing if different user
            User existingModerator = family.getModerator();

            if (existingModerator != null && !existingModerator.getId().equals(userToUpdate.getId())) {
                existingModerator.setRoles(new HashSet<>(List.of(
                        roleRepository.findByName(ERole.ROLE_USER).orElseThrow(() ->
                                new RuntimeException("ROLE_USER not found")
                        )
                )));
                existingModerator.setUpdatedBy(loggedInUser.getId());
                userRepository.save(existingModerator);
            }

            family.setModerator(userToUpdate);
            familyRepository.save(family);

        } else if (currentlyModerator && !willBeModerator) {
            // Moderator role removed, assign new moderator from other active users (if any)
            User newModerator = activeUsers.stream()
                    .filter(u -> !u.getId().equals(userToUpdate.getId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No other active user to assign as moderator."));

            // Assign moderator role to new moderator
            newModerator.setRoles(new HashSet<>(List.of(
                    roleRepository.findByName(ERole.ROLE_MODERATOR).orElseThrow(() ->
                            new RuntimeException("ROLE_MODERATOR not found")
                    )
            )));
            newModerator.setUpdatedBy(loggedInUser.getId());
            userRepository.save(newModerator);

            // Update family moderator reference
            family.setModerator(newModerator);
            familyRepository.save(family);
        }
    }

}
