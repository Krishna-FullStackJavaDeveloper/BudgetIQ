package com.auth.payload.response;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private String category;
    private BigDecimal amount;
    private Instant date;
    private Instant createdAt;
    private Instant updatedAt;
}
