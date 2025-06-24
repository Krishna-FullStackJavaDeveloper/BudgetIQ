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
public class GoalTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private SavingGoal goal;

    private Double amount;
    private Instant date;

    private String sourceNote; // e.g., "Freelance income - March"
    private boolean manuallyAdded = false;
    private boolean autoTransferred = false;

    private Instant createdAt;
    private Instant updatedAt;
}
