import type {
  ReportStatus,
  TaskAssignmentStatus,
  VerificationDecision,
} from '../types/report'

export const reportStatusLabels: Record<ReportStatus, string> = {
  New: 'Nowe',
  Verified: 'Zweryfikowane',
  Rejected: 'Odrzucone',
  Assigned: 'Przypisane',
  Completed: 'Zakończone',
}

export const assignmentStatusLabels: Record<TaskAssignmentStatus, string> = {
  New: 'Nowe',
  InProgress: 'W realizacji',
  Completed: 'Zakończone',
  Rejected: 'Odrzucone',
}

export const timelineStatusLabels: Record<TaskAssignmentStatus, string> = {
  New: 'Zgłoszono',
  InProgress: 'W realizacji',
  Completed: 'Zakończono',
  Rejected: 'Odrzucono',
}

export const verificationDecisionLabels: Record<VerificationDecision, string> =
  {
    Pending: 'Oczekuje',
    Accepted: 'Zaakceptowane',
    Rejected: 'Odrzucone',
  }
