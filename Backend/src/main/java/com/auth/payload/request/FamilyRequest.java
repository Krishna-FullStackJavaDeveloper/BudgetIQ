package com.auth.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FamilyRequest {
    @NotBlank
    @Size(max = 100)
    private String familyName;

    @NotBlank
    @Size(max = 120)
    @Pattern(regexp = "^[a-zA-Z0-9!@#$%^&*(),.?\":{}|<>_+\\-=]*$", message = "Password contains invalid characters.")
    private String passkey;
}
