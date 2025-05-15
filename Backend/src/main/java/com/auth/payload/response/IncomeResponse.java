package com.auth.payload.response;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeResponse {
    private Long id;
    private String source;
    private BigDecimal amount;
    private Instant date;
    private Instant createdAt;
    private Instant updatedAt;
}
