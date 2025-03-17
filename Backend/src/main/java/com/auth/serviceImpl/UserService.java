package com.auth.serviceImpl;

import com.auth.entity.User;
import com.auth.globalException.ResourceNotFoundException;
import com.auth.payload.response.GetAllUsersResponse;
import com.auth.repository.FamilyRepository;
import com.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;

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

}
