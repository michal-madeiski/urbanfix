import { apiClient } from './axiosClient'
import { mockApi } from '../mocks/mockApi'
import { normalizePagination, normalizeReport } from '../lib/apiNormalizers'
import type {
  CreateReportRequest,
  CreateReportResponse,
  PaginationResponse,
  Report,
  ReportListParams,
} from '../types/report'

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

function toQueryParams(params: ReportListParams = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  )
}

function toReportFormData(request: CreateReportRequest) {
  const formData = new FormData()

  formData.append('email', request.email)
  formData.append('description', request.description)
  formData.append('file', request.file)
  formData.append('latitude', String(request.latitude))
  formData.append('longitude', String(request.longitude))

  return formData
}

export async function getReportsByDateDesc(
  params?: ReportListParams,
): Promise<PaginationResponse<Report>> {
  if (useMocks) {
    return mockApi.getReportsByDateDesc(params)
  }

  const response = await apiClient.get<PaginationResponse<Report>>(
    '/api/reports/by-date-desc',
    { params: toQueryParams(params) },
  )
  return normalizePagination(response.data, normalizeReport)
}

export async function getReportsByDateAsc(
  params?: ReportListParams,
): Promise<PaginationResponse<Report>> {
  if (useMocks) {
    return mockApi.getReportsByDateAsc(params)
  }

  const response = await apiClient.get<PaginationResponse<Report>>(
    '/api/reports/by-date-asc',
    { params: toQueryParams(params) },
  )
  return normalizePagination(response.data, normalizeReport)
}

export async function getReport(reportId: string): Promise<Report | null> {
  if (useMocks) {
    return mockApi.getReport(reportId)
  }

  try {
    const response = await apiClient.get<Report>(`/api/reports/${reportId}`)
    return normalizeReport(response.data)
  } catch {
    return null
  }
}

export async function createReport(
  request: CreateReportRequest,
): Promise<CreateReportResponse> {
  if (useMocks) {
    return mockApi.createReport(request)
  }

  const response = await apiClient.post<CreateReportResponse>(
    '/api/reports',
    toReportFormData(request),
  )
  return response.data
}

export function getReportPhotoUrl(reportId: string) {
  if (useMocks) {
    return null
  }

  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5200'
  return `${baseUrl.replace(/\/$/, '')}/api/reports/${encodeURIComponent(
    reportId,
  )}/photo`
}
