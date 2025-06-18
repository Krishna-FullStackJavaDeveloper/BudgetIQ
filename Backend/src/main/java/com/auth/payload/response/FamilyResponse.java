package com.auth.payload.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class FamilyResponse {
    private Long id;
    private String familyName;
    private int userSize;
    private Instant createdAt;
    private Long moderatorId;
    private String moderatorUsername;

}
