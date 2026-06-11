import { apiClient } from './axiosClient'
import { mockApi } from '../mocks/mockApi'
import { normalizeTimelineEntry } from '../lib/apiNormalizers'
import type { TimelineEntry } from '../types/report'

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

export async function getTimeline(reportId: string): Promise<TimelineEntry[]> {
  if (useMocks) {
    return mockApi.getTimeline(reportId)
  }

  const response = await apiClient.get<TimelineEntry[]>(
    `/api/timelines/${reportId}`,
  )
  return response.data.map(normalizeTimelineEntry)
}
