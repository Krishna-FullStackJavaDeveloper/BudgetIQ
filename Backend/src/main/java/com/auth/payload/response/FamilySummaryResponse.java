package com.auth.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FamilySummaryResponse {
    private long totalFamilies;
    private long totalMembers;
    private long totalActiveUsers;
    private long totalOtherStatusUsers;
    private long totalFamilyAdmins;
    private long totalAdmins;
    private Map<String, FamilyDetail> familyDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FamilyDetail {
        private Long familyId;
        private int totalMembers;
        private long activeMembers;
        private long otherStatusMembers;
    }
}
