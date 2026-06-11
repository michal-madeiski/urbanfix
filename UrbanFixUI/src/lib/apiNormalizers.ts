import type {
  Assignment,
  PaginationResponse,
  Report,
  ReportStatus,
  TaskAssignmentStatus,
  TimelineEntry,
  Verification,
  VerificationDecision,
} from '../types/report'

const reportStatuses: ReportStatus[] = [
  'New',
  'Verified',
  'Rejected',
  'Assigned',
  'Completed',
]

const assignmentStatuses: TaskAssignmentStatus[] = [
  'New',
  'InProgress',
  'Completed',
  'Rejected',
]

const verificationDecisions: VerificationDecision[] = [
  'Pending',
  'Accepted',
  'Rejected',
]

function fromEnumValue<T extends string>(
  value: unknown,
  values: readonly T[],
  fallback: T,
) {
  if (typeof value === 'number') {
    return values[value] ?? fallback
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return values[Number(value)] ?? fallback
  }

  if (typeof value === 'string') {
    const matched = values.find(
      (val) => val.toLowerCase() === value.toLowerCase(),
    )
    if (matched) {
      return matched
    }
  }

  return fallback
}

export function normalizeReportStatus(value: unknown) {
  return fromEnumValue(value, reportStatuses, 'New')
}

export function normalizeAssignmentStatus(value: unknown) {
  return fromEnumValue(value, assignmentStatuses, 'New')
}

export function normalizeVerificationDecision(value: unknown) {
  return fromEnumValue(value, verificationDecisions, 'Pending')
}

export function normalizeReport(report: Report): Report {
  return {
    ...report,
    status: normalizeReportStatus(report.status),
  }
}

export function normalizeAssignment(assignment: Assignment): Assignment {
  return {
    ...assignment,
    status: normalizeAssignmentStatus(assignment.status),
  }
}

export function normalizeTimelineEntry(entry: TimelineEntry): TimelineEntry {
  return {
    ...entry,
    newStatus: normalizeAssignmentStatus(entry.newStatus),
  }
}

export function normalizeVerification(verification: Verification): Verification {
  return {
    ...verification,
    decision: normalizeVerificationDecision(verification.decision),
  }
}

export function normalizePagination<T>(
  response: PaginationResponse<T>,
  normalizeItem: (item: T) => T,
): PaginationResponse<T> {
  return {
    ...response,
    items: response.items.map(normalizeItem),
  }
}
