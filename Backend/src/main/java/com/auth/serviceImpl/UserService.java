package com.auth.serviceImpl;

import com.auth.eNum.AccountStatus;
import com.auth.eNum.ERole;
import com.auth.entity.Family;
import com.auth.entity.Role;
import com.auth.entity.User;
import com.auth.globalException.DuplicateResourceException;
import com.auth.globalException.InvalidRoleException;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.globalException.UnauthorizedAccessException;
import com.auth.payload.request.UpdateUserRequest;
import com.auth.payload.response.GetAllUsersResponse;
import com.auth.repository.FamilyRepository;
import com.auth.repository.RoleRepository;
import com.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final FamilyRepository familyRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User getUserById(Long id) {
        // Fetching the user using the repository method
        User user = userRepository.getUserByIdWithRoles(id);

        // Handling case if user is not found
        if (user == null) {
            throw new ResourceNotFoundException("User", "id", id);
        }

        return user;
    }


    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<GetAllUsersResponse> getAllUsersAsync() {
        List<User> allUsers = userRepository.findAllUsers();
        GetAllUsersResponse response = new GetAllUsersResponse(allUsers);
        return CompletableFuture.completedFuture(response);
    }

    @Transactional(readOnly = true)
    public GetAllUsersResponse getAllUsersByModerator(Long userId) {
        User moderator = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if user has ROLE_MODERATOR
        Set<String> roles = moderator.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        if (!roles.contains("ROLE_MODERATOR")) {
            throw new IllegalArgumentException("User is not a moderator.");
        }

        // Check if the moderator has a family assigned
        if (moderator.getFamily() == null) {
            throw new IllegalArgumentException("Moderator is not assigned to any family.");
        }

        Long familyId = moderator.getFamily().getId();
        List<User> usersInFamily = userRepository.findAllByFamilyId(familyId);

        return new GetAllUsersResponse(usersInFamily);
    }

//    @Transactional
//    @Transactional(rollbackFor = {ResourceNotFoundException.class, UnauthorizedAccessException.class})
    public Optional<User> updateUser(Long id, UpdateUserRequest request, Long loginUser) {
        try {
            log.info("Fetching user with ID: {}", id);
            User userToUpdate = userRepository.findByIdWithRolesAndFamily(id)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

            // Fetch the logged-in user (updatedByUserId) from the database
            User loggedInUser = userRepository.findByIdWithRolesAndFamily(loginUser)
                    .orElseThrow(() -> new ResourceNotFoundException("Logged-in user", "id", loginUser));
            log.debug("Fetched logged-in user: {}", loggedInUser);

            // Check if the logged-in user is allowed to update this profile
            if (!isAuthorizedToUpdate(loggedInUser, userToUpdate)) {
                log.warn("Unauthorized access attempt by user with ID: {} to update user with ID: {}", loginUser, id);
                throw new UnauthorizedAccessException("You are not authorized to update this user's profile.");
            }

            // Prevent the user from updating their own role
            if (loggedInUser.getRoles().stream().anyMatch(role -> role.getName() == ERole.ROLE_USER)) {
                // Only check this condition if roles are different
                Set<String> userRoles = userToUpdate.getRoles().stream()
                        .map(role -> role.getName().name()) // Assuming getName() returns an ERole enum
                        .collect(Collectors.toSet());

                // Only check this condition if roles are different
                if (request.getRole() != null && !request.getRole().equals(userRoles)) {
                    if (loggedInUser.getId().equals(userToUpdate.getId())) {
                        log.warn("User with ID: {} attempted to change their own role.", loginUser);
                        throw new UnauthorizedAccessException("You are not allowed to change your own role.");
                    }
                }
            }

            // Check if username or email already exists
            if (request.getUsername() != null && !request.getUsername().equals(userToUpdate.getUsername())) {
                // Check if the new username already exists in the database
                if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                    throw new DuplicateResourceException("Username is already taken");
                }
            }
            if (request.getEmail() != null && !request.getEmail().equals(userToUpdate.getEmail())) {
                // Check if the new email already exists in the database
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                    throw new DuplicateResourceException("Email is already in use");
                }
            }

            // Update fields if present
            if (request.getUsername() != null && !request.getUsername().equals(userToUpdate.getUsername()) &&
                    userRepository.findByUsername(request.getUsername()).isEmpty()) {
                userToUpdate.setUsername(request.getUsername());
            }

            if (request.getEmail() != null && !request.getEmail().equals(userToUpdate.getEmail()) &&
                    userRepository.findByEmail(request.getEmail()).isEmpty()) {
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
                userToUpdate.setAccountStatus(request.getAccountStatus());
            }

            // Update roles if provided
            if (request.getRole() != null && !request.getRole().isEmpty()) {
                Set<Role> updatedRoles = new HashSet<>();

                for (String roleName : request.getRole()) {
                    Role role = roleRepository.findByName(ERole.valueOf(roleName))
                            .orElseThrow(() -> new InvalidRoleException("Role " + roleName + " does not exist."));
                    updatedRoles.add(role);
                }

                // Check if the updater is an ADMIN
                if (loggedInUser.getRoles().stream()
                        .anyMatch(role -> role.getName().equals(ERole.ROLE_ADMIN))) {
                    // Admin can change any family member's role
                    userToUpdate.setRoles(updatedRoles);

                    // Check if the new role being assigned is MODERATOR
                    if (updatedRoles.stream().anyMatch(role -> role.getName().equals(ERole.ROLE_MODERATOR))) {
                        Family family = userToUpdate.getFamily();  // Get the family of the user being updated
                        User existingModerator = family.getModerator();  // Get the current moderator of the family

                        if (existingModerator != null) {
                            // If a moderator already exists, demote the existing moderator
                            existingModerator.getRoles().clear();  // Remove all roles
                            Optional<Role> roleOptional = roleRepository.findByName(ERole.ROLE_USER);
                            roleOptional.ifPresent(role -> existingModerator.setRoles(new HashSet<>(List.of(role))));
                            // Update the `updated_by` field for the previous family admin/moderator
                            existingModerator.setUpdatedBy(loginUser); // Update the field with the logged-in user
                            userRepository.save(existingModerator);  // Save the previous moderator

                            // Set the new moderator in the family
                            family.setModerator(userToUpdate);
                            familyRepository.save(family);  // Persist the family with the new moderator
                        }
                    }

                }
                // Check if the updater is a MODERATOR
                else if (loggedInUser.getRoles().stream()
                        .anyMatch(role -> role.getName().equals(ERole.ROLE_MODERATOR))) {
                    // Only allow updating family members
                    if (!loggedInUser.getFamily().getId().equals(userToUpdate.getFamily().getId())) {
                        throw new UnauthorizedAccessException("You can only update family members.");
                    }

                    // Moderator can only update roles within their own family
                    userToUpdate.setRoles(updatedRoles);

                    // Check if the new role being assigned is MODERATOR
                    if (updatedRoles.stream().anyMatch(role -> role.getName().equals(ERole.ROLE_MODERATOR))) {
                        Family family = loggedInUser.getFamily();  // Moderator's family
                        User existingModerator = family.getModerator();  // Get the current moderator of the family

                        if (existingModerator != null) {
                            // If a moderator already exists, demote the existing moderator
                            existingModerator.getRoles().clear();  // Remove all roles
                            Optional<Role> roleOptional = roleRepository.findByName(ERole.ROLE_USER);
                            roleOptional.ifPresent(role -> existingModerator.setRoles(new HashSet<>(List.of(role))));
                            // Update the `updated_by` field for the previous family admin/moderator
                            existingModerator.setUpdatedBy(loginUser); // Update the field with the logged-in user
                            userRepository.save(existingModerator);  // Save the previous moderator

                            // Set the new moderator in the family
                            family.setModerator(userToUpdate);
                            familyRepository.save(family);  // Persist the family with the new moderator
                        }
                    }
                }
            }

            // Update last modified timestamp and the updater's ID
            userToUpdate.setUpdatedAt(LocalDateTime.now());
            userToUpdate.setUpdatedBy(loginUser); // Store the user who made the update

            log.info("Updating user with ID: {}", id);
            userRepository.save(userToUpdate);

            log.info("User with ID: {} updated successfully", id);
            return Optional.of(userToUpdate);
        } catch (UnauthorizedAccessException ex) {
            log.error("Unauthorized access error while updating user with ID: {}", id, ex);
            throw ex;  // Re-throwing the exception to be handled by GlobalExceptionHandler
        } catch (ResourceNotFoundException ex) {
            log.error("Resource not found while updating user with ID: {}", id, ex);
            throw ex;  // Rethrow the exception so it can be caught by the global handler
        } catch (Exception e) {
            log.error("Error updating user with ID: {}", id, e);
            throw new RuntimeException("Error updating user: " + e.getMessage(), e);
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
}
