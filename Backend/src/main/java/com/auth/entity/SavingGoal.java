package com.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavingGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    private String title; // e.g., "Vacation Fund"
    private Double targetAmount;

    private Instant startDate;
    private Instant endDate;

    private boolean active = true;
    private boolean achieved = false;

    private Integer priority = 1; // 1 = High

    private String sourceCategory; // Optional: e.g., "Freelance"

    private boolean autoTransferSuggested = false;

    private Instant createdAt;
    private Instant updatedAt;
}
