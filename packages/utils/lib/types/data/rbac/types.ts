export type SystemPermission =
  | 'read:queue'
  | 'write:queue'
  | 'read:encounter'
  | 'write:encounter'
  | 'review:supervision'
  | 'manage:care-teams'
  | 'manage:tasks'
  | 'read:payroll'
  | 'admin:system';

export interface RoleDefinition {
  id: string;
  name: string;
  permissions: SystemPermission[];
}

export interface AccessScope {
  licensedStates: string[];
  clinicFlowIds: string[];
  locationIds?: string[];
}

export type IntegrityStatus = 'ok' | 'warning' | 'error';

export interface IntegritySignal {
  key: 'hipaa' | 'fhir-sync' | 'audit-log';
  status: IntegrityStatus;
  message?: string;
  updatedAt: string;
}
