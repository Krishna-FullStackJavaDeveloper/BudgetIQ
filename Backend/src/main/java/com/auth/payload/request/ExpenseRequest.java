package com.auth.payload.request;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

@Data
public class ExpenseRequest {
    private String category;
    private BigDecimal amount;
    private Instant date;
}
