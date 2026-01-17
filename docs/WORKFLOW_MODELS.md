# Workflow Models (Draft)

This document captures the first-pass data model and workflow definitions for the requested feature areas.

## 1. Supervision Logic (MD/DO Workflow)

**Goal:** Link supervising physicians (MD/DO) to mid-level clinicians (NP/PA), route charts for review, and record legal sign-off.

### Core Entities
- **SupervisionAssignment**: maps supervisees to supervisors per clinic flow and effective date.
- **SupervisionReviewQueueItem**: represents charts awaiting review by a supervisor.
- **SupervisionReview**: the audit record of approval/rejection.

### Workflow
1. **Assignment**: Admin assigns a supervisor to a supervisee for a clinic flow.
2. **Chart Drafted**: When a supervisee completes charting, a queue item is created.
3. **Supervisor Review**: Supervisor reviews and either approves or rejects.
4. **Ready to Export**: Approval moves chart to READY_TO_EXPORT for EMR sync.

## 2. Distributed Task Engine

**Goal:** Enable structured task assignment, personal to-do lists, and auditable completion events.

### Core Entities
- **ClinicalTask**: task object tied to encounter or patient.
- **TaskAssignment**: assignment metadata for assignee routing.
- **TaskAuditEvent**: immutable log of task lifecycle events.

### Workflow
1. **Create Task**: Clinician creates a task and assigns to a team member.
2. **Work Queue**: Assignee sees tasks in a personal to-do list.
3. **Completion**: Completion writes an audit event and updates the chart.

## 3. System Integrity & RBAC

**Goal:** Enforce jurisdiction filtering (state + clinic flow) and provide a compliance signal for UI telemetry.

### Core Entities
- **RoleDefinition**: role + permissions.
- **AccessScope**: licensed states + clinic flows.
- **IntegritySignal**: UI-facing status for HIPAA compliance + FHIR sync health.

### Workflow
1. **Authorize**: Check access scope before showing queue items.
2. **Filter**: Work queue is filtered to permitted states/flows.
3. **Telemetry**: Dashboard shows integrity signals (e.g., FHIR sync healthy).

## 4. Weekly Visit Logs

**Goal:** Track completed visits per week for reporting and operational analytics.

### Core Entities
- **WeeklyVisitLogRecord**: minimal record of a completed encounter.
- **WeeklyVisitLogSummary**: derived weekly count for reporting.

### Workflow
1. **Visit Completed**: Create a WeeklyVisitLogRecord with week bucket.
2. **Weekly Summary**: Aggregate per clinician by week for reporting.
