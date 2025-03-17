package com.auth.payload.response;

import com.auth.eNum.AccountStatus;
import com.auth.entity.Family;
import com.auth.entity.User;
import com.auth.globalUtils.DateFormatUtil;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class GetAllUsersResponse {
    private List<UserData> usersWithoutFamily;  // Users without any family
    private Map<String, FamilyData> families;   // Map to store family details

    public GetAllUsersResponse(List<User> allUsers) {
        // Users without any family
        this.usersWithoutFamily = allUsers.stream()
                .filter(user -> user.getFamily() == null)
                .map(UserData::new)
                .collect(Collectors.toList());

        // Families and their users
        this.families = allUsers.stream()
                .filter(user -> user.getFamily() != null)
                .collect(Collectors.groupingBy(
                        user -> user.getFamily().getFamilyName(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                usersInFamily -> {
                                    Family family = usersInFamily.get(0).getFamily();  // Get the first user in the family to extract family info
                                    return new FamilyData(family, usersInFamily);  // Return FamilyData with List<User>
                                }
                        )
                ));
    }

    @Getter
    @Setter
    public static class UserData {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private String phoneNumber;
        private String profilePic;
        private AccountStatus accountStatus;
        private String createdAt;
        private String updatedAt;
        private String lastLogin;
        private boolean twoFactorEnabled;
        private Set<String> roles;

        public UserData(User user) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.phoneNumber = user.getPhoneNumber();
            this.profilePic = user.getProfilePic();
            this.accountStatus = user.getAccountStatus();
            // Format dates using DateFormatUtil
            this.createdAt = DateFormatUtil.formatDate(user.getCreatedAt());
            this.updatedAt = DateFormatUtil.formatDate(user.getUpdatedAt());
            this.lastLogin = DateFormatUtil.formatDate(user.getLastLogin());

            this.twoFactorEnabled = user.isTwoFactorEnabled();
            this.roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());
        }
    }

    @Getter
    @Setter
    public static class FamilyData {
        private Long familyId;
        private String familyName;
        private String passkey;  // Optional field depending on your needs
        private Long moderatorId;
        private List<UserData> users;  // List of users in this family

        public FamilyData(Family family, List<User> users) {
            this.familyId = family.getId();
            this.familyName = family.getFamilyName();
            this.passkey = family.getPasskey(); // Store passkey if needed
            this.moderatorId = family.getModerator() != null ? family.getModerator().getId() : null;
            this.users = users.stream().map(UserData::new).collect(Collectors.toList());
        }
    }
}
