package com.auth.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlySummary {
    private String month; // e.g., "Jun-2025"
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal saving;
}
