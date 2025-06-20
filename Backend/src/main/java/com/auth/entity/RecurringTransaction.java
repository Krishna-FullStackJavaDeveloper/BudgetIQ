package com.auth.entity;

import com.auth.eNum.RepeatCycle;
import com.auth.eNum.TransactionType;
import com.auth.payload.request.RecurringTransactionRequest;
import com.auth.payload.response.RecurringTransactionResponse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "recurring_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecurringTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type; // EXPENSE, INCOME, etc.

    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    private RepeatCycle repeatCycle; // DAILY, WEEKLY, MONTHLY, etc.

    private String repeatDay; // e.g., 1 for 1st of month

    private String category;

    private LocalDate endDate; // Can be null

    @Column(columnDefinition = "TINYINT(1)")
    private boolean deleted = false; // Soft delete

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @Column(columnDefinition = "TINYINT(1)")
    private boolean enabled = true;

}
