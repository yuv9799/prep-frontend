import type { AnalyticsOverview, DashboardSummary, StudyActivity, SubjectProgress } from '../types/model'
import { asList, get } from './client'

export const analyticsApi = {
  async overview(): Promise<AnalyticsOverview> {
    return get<AnalyticsOverview>('/analytics/overview')
  },

  async dashboard(): Promise<DashboardSummary> {
    return get<DashboardSummary>('/analytics/dashboard')
  },

  async activity(days = 30): Promise<StudyActivity[]> {
    return asList<StudyActivity>(await get('/analytics/activity', { params: { days } }))
  },

  async subjectProgress(): Promise<SubjectProgress[]> {
    return asList<SubjectProgress>(await get('/analytics/subjects'))
  },
}
