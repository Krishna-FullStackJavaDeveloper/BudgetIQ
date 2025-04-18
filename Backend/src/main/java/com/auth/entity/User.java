package com.auth.entity;

import com.auth.eNum.AccountStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "user", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(max = 120)
    private String password;

    @NotBlank
    @Size(max = 50)
    private String fullName;

    @NotBlank
    @Size(max = 15)
    private String phoneNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "timezone_id")
    private Timezone timezone;

    @Lob
    @Column(name = "profile_pic", columnDefinition = "TEXT")
    private String profilePic;  // Storing profile picture as Base64-encoded string

    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus = AccountStatus.ACTIVE; // Enum for account status

    @CreationTimestamp
    private Instant createdAt; // Auto-set in UTC when record is created

    @UpdateTimestamp
    private Instant updatedAt; // Auto-updated in UTC when record is modified

    private Instant lastLogin; // Stores the last login time in UTC

    @Column(columnDefinition = "TINYINT(1)")
    private boolean twoFactorEnabled = false; // 2FA flag

    private Long updatedBy;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("expiryTime DESC") // Fetch the latest OTP first
    private List<OTP> otps = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id")
    private Family family;  // New field to track the family to which this user belongs

    private String resetToken; // Store the token
    private Instant tokenExpiry; // Store expiry time

    public void setFamily(Family family) {
        this.family = family;
        if (!family.getUsers().contains(this)) {
            family.getUsers().add(this);
        }
    }

    public User( String username, String email, String password, String fullName, String phoneNumber) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
    }

}
