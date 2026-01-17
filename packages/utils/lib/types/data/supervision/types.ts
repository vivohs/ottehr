export type SupervisionAssignmentStatus = 'active' | 'inactive';

export interface SupervisionAssignment {
  id: string;
  supervisorId: string;
  superviseeId: string;
  clinicFlowId: string;
  locationId?: string;
  effectiveStart: string;
  effectiveEnd?: string;
  status: SupervisionAssignmentStatus;
}

export type SupervisionReviewStatus = 'pending' | 'approved' | 'rejected';

export interface SupervisionReviewQueueItem {
  id: string;
  encounterId: string;
  patientId: string;
  superviseeId: string;
  supervisorId: string;
  status: SupervisionReviewStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface SupervisionReview {
  id: string;
  encounterId: string;
  supervisorId: string;
  status: Exclude<SupervisionReviewStatus, 'pending'>;
  reviewedAt: string;
  notes?: string;
}
