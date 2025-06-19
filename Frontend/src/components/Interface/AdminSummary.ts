export interface FamilyDetail {
  familyId: number;
  totalMembers: number;
  activeMembers: number;
  otherStatusMembers: number;
}

export interface AdminSummary {
  totalFamilies: number;
  totalMembers: number;
  totalActiveUsers: number;
  totalOtherStatusUsers: number;
  totalFamilyAdmins: number;
  totalAdmins: number;
  familyDetails: {
    [familyName: string]: FamilyDetail;
  };
}
