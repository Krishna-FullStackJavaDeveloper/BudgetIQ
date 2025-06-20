package com.auth.payload.response;

import com.auth.eNum.RepeatCycle;
import com.auth.eNum.TransactionType;
import com.auth.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RecurringTransactionResponse {
    private Long userId;
    private UUID id;
    private String title;
    private BigDecimal amount;
    private TransactionType type;
    private String startDate;  // formatted
    private RepeatCycle repeatCycle;
    private String repeatDay;
    private String category;
    private String endDate;    // formatted
    private String createdAt;
    private String updatedAt;
}
