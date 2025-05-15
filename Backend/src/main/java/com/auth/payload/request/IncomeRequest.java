package com.auth.payload.request;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IncomeRequest {
    private String source;
    private BigDecimal amount;
    private Instant date;
}
