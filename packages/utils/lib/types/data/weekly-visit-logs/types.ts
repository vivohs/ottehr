export interface WeeklyVisitLogRecord {
  id: string;
  encounterId: string;
  clinicianId: string;
  clinicFlowId: string;
  completedAt: string;
  weekOf: string;
}

export interface WeeklyVisitLogSummary {
  clinicianId: string;
  weekStart: string;
  weekEnd: string;
  completedVisitsCount: number;
}
