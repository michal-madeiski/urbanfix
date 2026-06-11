import { apiClient } from './axiosClient'
import { mockApi } from '../mocks/mockApi'
import { isUnauthorizedError } from '../lib/apiErrors'
import { normalizePagination, normalizeVerification } from '../lib/apiNormalizers'
import type {
  PaginationResponse,
  Verification,
  VerificationLookupResponse,
  VerifyCommentRequest,
} from '../types/report'

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

export async function getVerifications(
  pageNumber = 1,
  pageSize = 10,
): Promise<PaginationResponse<Verification>> {
  if (useMocks) {
    return mockApi.getVerifications(pageNumber, pageSize)
  }

  const response = await apiClient.get<PaginationResponse<Verification>>(
    '/api/verifications',
    { params: { pageNumber, pageSize } },
  )
  return normalizePagination(response.data, normalizeVerification)
}

export async function getVerification(
  reportId: string,
): Promise<VerificationLookupResponse | null> {
  if (useMocks) {
    return mockApi.getVerification(reportId)
  }

  try {
    const response = await apiClient.get<VerificationLookupResponse>(
      `/api/verifications/${reportId}`,
    )
    return response.data
  } catch (error) {
    if (isUnauthorizedError(error)) {
      throw error
    }

    return null
  }
}

export async function acceptVerification(
  reportId: string,
  request: VerifyCommentRequest,
) {
  if (useMocks) {
    return mockApi.acceptVerification(reportId, request)
  }

  await apiClient.patch(`/api/verifications/${reportId}/accepted`, request)
  return true
}

export async function rejectVerification(
  reportId: string,
  request: VerifyCommentRequest,
) {
  if (useMocks) {
    return mockApi.rejectVerification(reportId, request)
  }

  await apiClient.patch(`/api/verifications/${reportId}/rejected`, request)
  return true
}
