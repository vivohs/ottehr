export type CareTeamRole = 'Clinician' | 'Supervisor' | 'RN' | 'MA' | 'PCR' | 'Support';

export interface CareTeamMember {
  userId: string;
  role: CareTeamRole;
  displayName: string;
}

export interface CareTeamAssignment {
  id: string;
  clinicFlowId: string;
  locationId?: string;
  clinicianId: string;
  supportMemberIds: string[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CareTeamFeedEntry {
  id: string;
  encounterId: string;
  authorId: string;
  message: string;
  mentionedUserIds?: string[];
  createdAt: string;
}
