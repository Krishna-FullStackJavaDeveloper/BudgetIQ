package com.auth.payload.request;

import com.auth.eNum.AccountStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Set;

@Getter
@Setter
public class UpdateUserRequest {

    @Size(min = 1, max = 20, message = "Username must be between 1 and 20 characters.")
    private String username;

    @Size(min = 1, max = 50)
    @Email(message = "Invalid email format.")
    private String email;

    @Size(min = 1, max = 50, message = "Full name must be between 1 and 50 characters.")
    private String fullName;

    @Size(min = 1, max = 15, message = "Phone number must be between 1 and 15 characters.")
    private String phoneNumber;

    @Size(min = 8, max = 120, message = "Password must be at least 8 characters.")
    private String password; // Optional, but must be valid if provided

    private Boolean twoFactorEnabled; // Boolean can be null, making it optional

    private Set<String> role; // Updated to Set<String> for roles

    private AccountStatus accountStatus;

}
