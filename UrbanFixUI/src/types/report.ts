export type ReportStatus =
  | 'New'
  | 'Verified'
  | 'Rejected'
  | 'Assigned'
  | 'Completed'

export type TaskAssignmentStatus =
  | 'New'
  | 'InProgress'
  | 'Completed'
  | 'Rejected'

export type VerificationDecision = 'Pending' | 'Accepted' | 'Rejected'

export type PaginationResponse<T> = {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export type Report = {
  id: string
  submitterEmail: string | null
  fileName: string | null
  fileExtension: string | null
  description: string
  latitude: number
  longitude: number
  fileSize: number
  uploadedAt: string
  s3ObjectKey: string | null
  status: ReportStatus
}

export type CreateReportRequest = {
  email: string
  description: string
  file: File
  latitude: number
  longitude: number
}

export type ReportListParams = {
  pageNumber?: number
  pageSize?: number
  from?: string
  to?: string
  status?: ReportStatus
}

export type CreateReportResponse = {
  reportId: string
}

export type Verification = {
  verificationId: string
  reportId: string
  submitterEmail: string | null
  officeWorkerId: string
  decision: VerificationDecision
  comment: string | null
  verifiedAt: string
}

export type VerificationLookupResponse = {
  verificationId: string
}

export type VerifyCommentRequest = {
  comment: string | null
}

export type Assignment = {
  assignmentId: string
  reportId: string
  assignedTeamId: string
  teamName: string | null
  teamAvailable: boolean | null
  status: TaskAssignmentStatus
}

export type TechnicalTeam = {
  id: string
  name: string
  isAvailable: boolean
}

export type CreateTeamRequest = {
  name: string
  isAvailable?: boolean
}

export type UpdateTeamRequest = {
  name?: string
  isAvailable?: boolean
}

export type TeamScope = 'all' | 'available' | 'unavailable'

export type TimelineEntry = {
  id: string
  reportId: string
  newStatus: TaskAssignmentStatus
  description: string | null
  occurredAt: string
}

export type Notification = {
  id: string
  reportId: string
  recipientEmail: string | null
  messageBody: string
  sentAt: string
}
