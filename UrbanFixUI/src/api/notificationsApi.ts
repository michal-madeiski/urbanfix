import { apiClient } from './axiosClient'
import { mockApi } from '../mocks/mockApi'
import type { Notification } from '../types/report'

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

export async function getNotifications(
  reportId: string,
): Promise<Notification[]> {
  if (useMocks) {
    return mockApi.getNotifications(reportId)
  }

  const response = await apiClient.get<Notification[]>(
    `/api/notifications/${reportId}`,
  )
  return response.data
}
