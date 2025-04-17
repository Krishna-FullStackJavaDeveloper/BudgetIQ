package com.auth.payload.response;

import com.auth.eNum.AccountStatus;
import com.auth.entity.Family;
import com.auth.entity.User;
import com.auth.globalUtils.DateFormatUtil;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@Setter
public class GetAllUsersResponse {
    private List<UserData> usersWithoutFamily;  // Users without any family
    private Map<String, FamilyData> families;   // Map to store family details

    public GetAllUsersResponse(List<User> allUsers, ZoneId loginUserZoneId) {
        // Users without any family
        this.usersWithoutFamily = allUsers.stream()
                .filter(user -> user.getFamily() == null)
                .map(user -> new UserData(user, loginUserZoneId))
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
                                    return new FamilyData(family, usersInFamily, loginUserZoneId);  // Return FamilyData with List<User>
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
        private TimezoneCountryDTO timezone;

        public UserData(User user, ZoneId loginUserZoneId) {
            this.id = user.getId();
            this.username = user.getUsername();
            this.email = user.getEmail();
            this.fullName = user.getFullName();
            this.phoneNumber = user.getPhoneNumber();
            this.profilePic = user.getProfilePic();
            this.accountStatus = user.getAccountStatus();
            // Format dates using DateFormatUtil
            this.createdAt = DateFormatUtil.formatDate(user.getCreatedAt(), loginUserZoneId);
            this.updatedAt = DateFormatUtil.formatDate(user.getUpdatedAt(), loginUserZoneId);
            this.lastLogin = DateFormatUtil.formatDate(user.getLastLogin(), loginUserZoneId);


            this.twoFactorEnabled = user.isTwoFactorEnabled();
            this.roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());

            // Check if the user has a timezone and map it to TimezoneCountryDTO
            if (user.getTimezone() != null) {
                this.timezone = new TimezoneCountryDTO(
                        user.getTimezone().getTimezone(), // assuming timezone is a string
                        user.getTimezone().getCountry().getIso(), // country ISO code
                        user.getTimezone().getCountry().getCountry(), // country name
                        user.getTimezone().getCountry().getCapital(), // capital city
                        user.getTimezone().getCountry().getCurrencyCode(), // currency code
                        user.getTimezone().getCountry().getCurrencyName() // currency name
                );
            } else {
                this.timezone = null; // No timezone available for this user
            }

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

        public FamilyData(Family family, List<User> users, ZoneId loginUserZoneId) {
            this.familyId = family.getId();
            this.familyName = family.getFamilyName();
            this.passkey = family.getPasskey(); // Store passkey if needed
            this.moderatorId = family.getModerator() != null ? family.getModerator().getId() : null;
            this.users = users.stream().map(user -> new UserData(user, loginUserZoneId)).collect(Collectors.toList());
        }
    }
}
