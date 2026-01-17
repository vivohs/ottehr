export type ClinicalTaskStatus = 'open' | 'in-progress' | 'blocked' | 'completed' | 'canceled';

export interface ClinicalTask {
  id: string;
  encounterId?: string;
  patientId?: string;
  title: string;
  description?: string;
  status: ClinicalTaskStatus;
  assigneeId?: string;
  createdBy: string;
  createdAt: string;
  dueAt?: string;
  completedAt?: string;
  completedBy?: string;
  tags?: string[];
}

export interface TaskAssignment {
  taskId: string;
  assigneeId: string;
  assignedBy: string;
  assignedAt: string;
}

export type TaskAuditEventType =
  | 'created'
  | 'assigned'
  | 'status-changed'
  | 'completed'
  | 'commented';

export interface TaskAuditEvent {
  id: string;
  taskId: string;
  eventType: TaskAuditEventType;
  actorId: string;
  occurredAt: string;
  metadata?: Record<string, string | number | boolean | null>;
}
