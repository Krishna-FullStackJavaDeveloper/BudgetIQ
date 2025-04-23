package com.auth.payload.response;

import lombok.Data;

import java.time.Instant;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private String iconName;
    private String color;
    private Long userId;
    private Long createdBy;
    private Long updatedBy;
    private Instant createdAt;
    private Instant updatedAt;
}
