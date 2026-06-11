import { apiClient } from './axiosClient'
import { mockApi } from '../mocks/mockApi'
import { isUnauthorizedError } from '../lib/apiErrors'
import { normalizeAssignment, normalizePagination } from '../lib/apiNormalizers'
import type {
  Assignment,
  CreateTeamRequest,
  PaginationResponse,
  TeamScope,
  TechnicalTeam,
  UpdateTeamRequest,
} from '../types/report'

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

export async function getAssignments(
  pageNumber = 1,
  pageSize = 10,
): Promise<PaginationResponse<Assignment>> {
  if (useMocks) {
    return mockApi.getAssignments(pageNumber, pageSize)
  }

  const response = await apiClient.get<PaginationResponse<Assignment>>(
    '/api/assignments',
    { params: { pageNumber, pageSize } },
  )
  return normalizePagination(response.data, normalizeAssignment)
}

export async function getAssignment(reportId: string) {
  if (useMocks) {
    return mockApi.getAssignment(reportId)
  }

  try {
    const response = await apiClient.get<Assignment>(
      `/api/assignments/${reportId}`,
    )
    return normalizeAssignment(response.data)
  } catch (error) {
    if (isUnauthorizedError(error)) {
      throw error
    }

    return null
  }
}

export async function completeAssignment(assignmentId: string) {
  if (useMocks) {
    return mockApi.completeAssignment(assignmentId)
  }

  await apiClient.post(`/api/assignments/${assignmentId}/complete`)
  return true
}

export async function getTeams(scope: TeamScope = 'all') {
  if (useMocks) {
    return mockApi.getTeams(scope)
  }

  const suffix = scope === 'all' ? 'all' : scope
  const response = await apiClient.get<TechnicalTeam[]>(
    `/api/assignments/teams/${suffix}`,
  )
  return response.data
}

export async function getTeam(teamId: string) {
  if (useMocks) {
    return mockApi.getTeam(teamId)
  }

  try {
    const response = await apiClient.get<TechnicalTeam>(
      `/api/assignments/teams/${teamId}`,
    )
    return response.data
  } catch (error) {
    if (isUnauthorizedError(error)) {
      throw error
    }

    return null
  }
}

export async function createTeam(request: CreateTeamRequest) {
  if (useMocks) {
    return mockApi.createTeam(request)
  }

  const response = await apiClient.post<TechnicalTeam>(
    '/api/assignments/teams',
    request,
  )
  return response.data
}

export async function updateTeam(teamId: string, request: UpdateTeamRequest) {
  if (useMocks) {
    return mockApi.updateTeam(teamId, request)
  }

  try {
    const response = await apiClient.patch<TechnicalTeam>(
      `/api/assignments/teams/${teamId}`,
      request,
    )
    return response.data
  } catch (error) {
    if (isUnauthorizedError(error)) {
      throw error
    }

    return null
  }
}

export async function deleteTeam(teamId: string) {
  if (useMocks) {
    return mockApi.deleteTeam(teamId)
  }

  await apiClient.delete(`/api/assignments/teams/${teamId}`)
  return true
}
