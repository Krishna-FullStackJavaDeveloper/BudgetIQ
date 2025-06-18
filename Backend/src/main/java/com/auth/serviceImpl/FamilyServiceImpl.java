package com.auth.serviceImpl;

import com.auth.email.EmailService;
import com.auth.entity.Family;
import com.auth.entity.User;
import com.auth.payload.request.FamilyRequest;
import com.auth.payload.request.SignupRequest;
import com.auth.payload.response.FamilyResponse;
import com.auth.repository.FamilyRepository;
import com.auth.repository.UserRepository;
import com.auth.service.FamilyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
@Service
@Slf4j
@RequiredArgsConstructor
public class FamilyServiceImpl implements FamilyService {

    private final FamilyRepository familyRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final UserDetailsServiceImpl userDetailsService;
    private final PasswordEncoder encoder;

    @Transactional
    public Family createFamilyByAdmin(User admin, SignupRequest signupRequest) throws Exception {

        String familyName = signupRequest.getFamilyName();

        if (familyName == null || familyName.trim().isEmpty()) {
            throw new RuntimeException("Error: Family name is required.");
        }
        if (familyRepository.existsByFamilyName(familyName)) {
            throw new RuntimeException("Error: Family name already exists.");
        }
        if(signupRequest.getPasskey().trim().isEmpty()){
            throw new RuntimeException("Error: Family Password required.");
        }

        Family family = new Family(familyName);
        family.setModerator(admin);
        family.setPasskey(signupRequest.getPasskey());
        family.setUserSize(1); // Initially, 1 (the moderator)
        familyRepository.save(family);

        admin.setFamily(family);
        userRepository.save(admin);  // Link admin as moderator of the family
        return family;
    }

    @Transactional
    public User createFamilyUser(SignupRequest signUpRequest) throws Exception {
        String familyPass = signUpRequest.getPasskey();

        if (signUpRequest.getFamilyName() == null || signUpRequest.getFamilyName().trim().isEmpty()) {
            throw new RuntimeException("Error: Family name is required.");
        }

        Optional<User> familyAdmin = userDetailsService.getModeratorFromRequest(signUpRequest.getFamilyName());
        if (familyAdmin.isEmpty()) {
            throw new RuntimeException("Error: Family Admin not found for the family.");
        }

        Optional<Family> familyOptional = familyRepository.findByFamilyName(signUpRequest.getFamilyName());
        if (familyOptional.isEmpty()) {
            throw new RuntimeException("Error: Family not found.");
        }

        Family family = familyOptional.get();  //  Extract family safely before using it

        if (!familyPass.equals(family.getPasskey())){
            throw new RuntimeException(" Family Password is incorrect.");
        }

        Hibernate.initialize(family.getUsers());

        long activeUserCount = family.getUsers().stream()
                .filter(user -> user.getAccountStatus().name().equalsIgnoreCase("ACTIVE"))
                .count();

        if (activeUserCount >= 6) {
            throw new RuntimeException("Error: Family user size limit (6) reached.");
        }
        User user = userDetailsService.createNewUser(signUpRequest);
        user.setFamily(family);  // Assign user to family


        family.setUserSize(family.getUserSize() + 1);
        familyRepository.save(family);

        sendNotificationEmail(familyAdmin.get(), user);
        return user;
    }

    @Async
    private void sendNotificationEmail(User moderator, User user) {
        // Send email to the moderator(family-admin)
        emailService.sendLoginNotification(moderator.getEmail(), moderator.getFullName(), "userCreated");

        //send email to the user
        emailService.sendLoginNotification(user.getEmail(), user.getFullName(), "register");
    }

    // ✅ Get all families (admin/moderator)
    public Page<FamilyResponse> getAllFamilies(Pageable pageable, UserDetailsImpl loggedInUser) {
        return familyRepository.findAll(pageable).map(this::mapToResponse);
    }

    // ✅ Get single family by ID
    public FamilyResponse getFamilyById(Long id, UserDetailsImpl loggedInUser) {
        Family family = familyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Family not found with id: " + id));
        // Check if the logged-in user is a member of the family or has ADMIN role
        boolean isMember = family.getUsers().stream()
                .anyMatch(user -> user.getId().equals(loggedInUser.getId()));

        boolean isAdmin = loggedInUser.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

        if (!isMember && !isAdmin) {
            throw new RuntimeException("Access denied: You are not authorized to view this family.");
        }
        return mapToResponse(family);
    }

    // ✅ Update family by ID
    public FamilyResponse updateFamily(Long id, FamilyRequest request, UserDetailsImpl loggedInUser) {
        Family family = familyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Family not found with id: " + id));

        // Check if the logged-in user is a member of the family or has ADMIN role
        boolean isMember = family.getUsers().stream()
                .anyMatch(user -> user.getId().equals(loggedInUser.getId()));

        boolean isAdmin = loggedInUser.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

        if (!isMember && !isAdmin) {
            throw new RuntimeException("Access denied: You are not authorized to view this family.");
        }

        family.setFamilyName(request.getFamilyName());
        if (request.getPasskey() != null && !request.getPasskey().isEmpty()) {
            family.setPasskey(request.getPasskey());
        }
        familyRepository.save(family);

        return mapToResponse(family);
    }

    public FamilyResponse getFamilyByUserId(Long userId) {
        // Fetch the family the user belongs to
        Family family = familyRepository.findByUsers_Id(userId)
                .orElseThrow(() -> new RuntimeException("No family found for the user"));

        // Get count of ACTIVE users in this family
        long activeUserCount = familyRepository.countActiveUsersByFamilyId(family.getId());

        // Log or return the active user size as needed
        log.info("Active users in family '{}': {}", family.getFamilyName(), activeUserCount);

        FamilyResponse response = mapToResponse(family);
        response.setUserSize((int) activeUserCount); // update the response with active user count

        return response;
    }

    // ✅ Private helper to convert entity to response DTO
    private FamilyResponse mapToResponse(Family family) {
        User moderator = family.getModerator();

        return FamilyResponse.builder()
                .id(family.getId())
                .familyName(family.getFamilyName())
                .userSize(family.getUserSize())
                .createdAt(family.getCreatedAt())
                .moderatorId(moderator != null ? moderator.getId() : null)
                .moderatorUsername(moderator != null ? moderator.getUsername() : null)
                .build();
    }
}
