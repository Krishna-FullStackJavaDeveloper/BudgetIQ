package com.auth.payload.response;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SummaryResponse {
    private String name;
    private List<MonthlySummary> monthlyData;
    private String timezone;        // e.g., "Asia/Kolkata"
    private String currencyCode;    // e.g., "INR"
    private String currencyName;    // e.g., "Indian Rupee"
}
