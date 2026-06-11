import {
  mockAssignments,
  mockNotifications,
  mockReports,
  mockTeams,
  mockTimelines,
  mockVerifications,
} from './mockData'
import type {
  Assignment,
  CreateReportRequest,
  CreateReportResponse,
  CreateTeamRequest,
  Notification,
  PaginationResponse,
  Report,
  ReportListParams,
  TeamScope,
  TechnicalTeam,
  TimelineEntry,
  UpdateTeamRequest,
  VerificationLookupResponse,
  VerifyCommentRequest,
} from '../types/report'

const reports = [...mockReports]
const assignments = [...mockAssignments]
const notifications = [...mockNotifications]
const teams = [...mockTeams]
const timelines = [...mockTimelines]
const verifications = [...mockVerifications]

const delay = 120

function wait<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay)
  })
}

function createId() {
  return crypto.randomUUID()
}

function paginate<T>(
  items: T[],
  pageNumber = 1,
  pageSize = 10,
): PaginationResponse<T> {
  const safePageNumber = Math.max(1, pageNumber)
  const safePageSize = Math.max(1, pageSize)
  const totalCount = items.length
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize))
  const start = (safePageNumber - 1) * safePageSize

  return {
    items: items.slice(start, start + safePageSize),
    pageNumber: safePageNumber,
    pageSize: safePageSize,
    totalCount,
    totalPages,
    hasPreviousPage: safePageNumber > 1,
    hasNextPage: safePageNumber < totalPages,
  }
}

function filterReports(params: ReportListParams = {}) {
  return reports.filter((report) => {
    if (params.status && report.status !== params.status) {
      return false
    }

    if (params.from && new Date(report.uploadedAt) < new Date(params.from)) {
      return false
    }

    if (params.to && new Date(report.uploadedAt) > new Date(params.to)) {
      return false
    }

    return true
  })
}

function sortReports(reportsToSort: Report[], sortDescending: boolean) {
  return [...reportsToSort].sort((a, b) => {
    const first = new Date(a.uploadedAt).getTime()
    const second = new Date(b.uploadedAt).getTime()

    return sortDescending ? second - first : first - second
  })
}

function findReportIndex(reportId: string) {
  return reports.findIndex((report) => report.id === reportId)
}

function syncAssignmentTeam(assignment: Assignment) {
  const team = teams.find((team) => team.id === assignment.assignedTeamId)

  assignment.teamName = team?.name ?? null
  assignment.teamAvailable = team?.isAvailable ?? null
}

export const mockApi = {
  getReportsByDateDesc(params?: ReportListParams) {
    const filtered = filterReports(params)
    const sorted = sortReports(filtered, true)
    return wait(paginate(sorted, params?.pageNumber, params?.pageSize))
  },

  getReportsByDateAsc(params?: ReportListParams) {
    const filtered = filterReports(params)
    const sorted = sortReports(filtered, false)
    return wait(paginate(sorted, params?.pageNumber, params?.pageSize))
  },

  getReport(reportId: string) {
    return wait(reports.find((report) => report.id === reportId) ?? null)
  },

  createReport(request: CreateReportRequest): Promise<CreateReportResponse> {
    const reportId = createId()
    const fileExtensionMatch = request.file.name.match(/\.[^.]+$/)
    const fileExtension = fileExtensionMatch?.[0] ?? null

    reports.unshift({
      id: reportId,
      submitterEmail: request.email,
      fileName: request.file.name,
      fileExtension,
      description: request.description,
      latitude: request.latitude,
      longitude: request.longitude,
      fileSize: request.file.size,
      uploadedAt: new Date().toISOString(),
      s3ObjectKey: `reports/${reportId}${fileExtension ?? ''}`,
      status: 'New',
    })

    verifications.unshift({
      verificationId: createId(),
      reportId,
      submitterEmail: request.email,
      officeWorkerId: 'Admin_01',
      decision: 'Pending',
      comment: null,
      verifiedAt: new Date().toISOString(),
    })

    return wait({ reportId })
  },

  getReportPhoto(reportId: string) {
    const report = reports.find((report) => report.id === reportId)

    if (!report) {
      return wait(null)
    }

    return wait(`mock-photo://${reportId}`)
  },

  getVerifications(pageNumber?: number, pageSize?: number) {
    return wait(paginate(verifications, pageNumber, pageSize))
  },

  getVerification(reportId: string): Promise<VerificationLookupResponse | null> {
    const verification = verifications.find(
      (verification) => verification.reportId === reportId,
    )

    return wait(
      verification ? { verificationId: verification.verificationId } : null,
    )
  },

  acceptVerification(reportId: string, request: VerifyCommentRequest) {
    const verification = verifications.find(
      (verification) => verification.reportId === reportId,
    )
    const reportIndex = findReportIndex(reportId)

    if (!verification || reportIndex === -1) {
      return wait(false)
    }

    verification.decision = 'Accepted'
    verification.comment = request.comment
    verification.verifiedAt = new Date().toISOString()
    reports[reportIndex].status = 'Verified'

    return wait(true)
  },

  rejectVerification(reportId: string, request: VerifyCommentRequest) {
    const verification = verifications.find(
      (verification) => verification.reportId === reportId,
    )
    const reportIndex = findReportIndex(reportId)

    if (!verification || reportIndex === -1) {
      return wait(false)
    }

    verification.decision = 'Rejected'
    verification.comment = request.comment
    verification.verifiedAt = new Date().toISOString()
    reports[reportIndex].status = 'Rejected'

    return wait(true)
  },

  getAssignments(pageNumber?: number, pageSize?: number) {
    assignments.forEach(syncAssignmentTeam)
    return wait(paginate(assignments, pageNumber, pageSize))
  },

  getAssignment(reportId: string) {
    const assignment =
      assignments.find((assignment) => assignment.reportId === reportId) ?? null

    if (assignment) {
      syncAssignmentTeam(assignment)
    }

    return wait(assignment)
  },

  completeAssignment(assignmentId: string) {
    const assignment = assignments.find(
      (assignment) => assignment.assignmentId === assignmentId,
    )

    if (!assignment) {
      return wait(false)
    }

    assignment.status = 'Completed'

    const reportIndex = findReportIndex(assignment.reportId)
    if (reportIndex !== -1) {
      reports[reportIndex].status = 'Completed'
    }

    timelines.push({
      id: createId(),
      reportId: assignment.reportId,
      newStatus: 'Completed',
      description: 'Zadanie zakończone.',
      occurredAt: new Date().toISOString(),
    })

    return wait(true)
  },

  getTeams(scope: TeamScope = 'all') {
    if (scope === 'available') {
      return wait(teams.filter((team) => team.isAvailable))
    }

    if (scope === 'unavailable') {
      return wait(teams.filter((team) => !team.isAvailable))
    }

    return wait([...teams])
  },

  getTeam(teamId: string) {
    return wait(teams.find((team) => team.id === teamId) ?? null)
  },

  createTeam(request: CreateTeamRequest): Promise<TechnicalTeam> {
    const team = {
      id: createId(),
      name: request.name,
      isAvailable: request.isAvailable ?? true,
    }

    teams.push(team)
    return wait(team)
  },

  updateTeam(teamId: string, request: UpdateTeamRequest) {
    const team = teams.find((team) => team.id === teamId)

    if (!team) {
      return wait(null)
    }

    if (request.name !== undefined) {
      team.name = request.name
    }

    if (request.isAvailable !== undefined) {
      team.isAvailable = request.isAvailable
    }

    return wait(team)
  },

  deleteTeam(teamId: string) {
    const teamIndex = teams.findIndex((team) => team.id === teamId)

    if (teamIndex === -1) {
      return wait(false)
    }

    teams.splice(teamIndex, 1)
    return wait(true)
  },

  getTimeline(reportId: string): Promise<TimelineEntry[]> {
    return wait(
      timelines
        .filter((timeline) => timeline.reportId === reportId)
        .sort(
          (a, b) =>
            new Date(a.occurredAt).getTime() -
            new Date(b.occurredAt).getTime(),
        ),
    )
  },

  getNotifications(reportId: string): Promise<Notification[]> {
    return wait(
      notifications
        .filter((notification) => notification.reportId === reportId)
        .sort(
          (a, b) =>
            new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
        ),
    )
  },
}
