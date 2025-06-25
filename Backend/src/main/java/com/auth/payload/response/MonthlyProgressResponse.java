package com.auth.payload.response;

import lombok.*;


public class MonthlyProgressResponse {
    private String month;
    private double totalSaved;

    // Explicit public constructor matching JPQL parameters
    public MonthlyProgressResponse(String month, double totalSaved) {
        this.month = month;
        this.totalSaved = totalSaved;
    }

    // Getters and setters

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public double getTotalSaved() {
        return totalSaved;
    }

    public void setTotalSaved(double totalSaved) {
        this.totalSaved = totalSaved;
    }
}
