package com.auth.payload.request;

import lombok.Data;

@Data
public class GoalSearchFilter {
    private String keyword = "";
    private String sortBy = "createdAt";
    private String direction = "desc";
    private int page = 0;
    private int size = 10;
}
