package com.auth.payload.response;

import com.auth.eNum.AccountStatus;
import com.auth.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Set;
import java.util.stream.Collectors;
import com.auth.globalUtils.DateFormatUtil;

@Getter
@Setter
public class GetUserByIdResponse {
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
    private String familyName;
    private TimezoneCountryDTO timezoneDetails;

    public GetUserByIdResponse(User user , ZoneId loginUserZoneId) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.fullName = user.getFullName();
        this.phoneNumber = user.getPhoneNumber();
        this.profilePic = user.getProfilePic();
        this.accountStatus = user.getAccountStatus();
        // Format date-time according to timezone
        this.createdAt = DateFormatUtil.formatDate(user.getCreatedAt(), loginUserZoneId);
        this.updatedAt = DateFormatUtil.formatDate(user.getUpdatedAt(), loginUserZoneId);
        this.lastLogin = DateFormatUtil.formatDate(user.getLastLogin(), loginUserZoneId);

        this.twoFactorEnabled = user.isTwoFactorEnabled();
        this.roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toSet());
    // Include family information if available
        if (user.getFamily() != null) {
            this.familyName = user.getFamily().getFamilyName();
        } else {
            this.familyName = null; // Or handle differently if you prefer
        }
        if (user.getTimezone() != null && user.getTimezone().getCountry() != null) {
            this.timezoneDetails = new TimezoneCountryDTO(
                    user.getTimezone().getTimezone(),
                    user.getTimezone().getCountry().getIso(),
                    user.getTimezone().getCountry().getCountry(),
                    user.getTimezone().getCountry().getCapital(),
                    user.getTimezone().getCountry().getCurrencyCode(),
                    user.getTimezone().getCountry().getCurrencyName()
            );
        }else {
            this.timezoneDetails = null; // Or handle differently if you prefer
        }
    }
}
