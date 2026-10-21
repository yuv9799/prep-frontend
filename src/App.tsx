import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/app-layout'
import { ProtectedRoute, PublicOnlyRoute } from './components/routing/protected-route'
import { Spinner } from './components/ui'

const LoginPage = lazy(() =>
  import('./features/auth/login-page').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('./features/auth/register-page').then((m) => ({ default: m.RegisterPage })),
)
const DashboardPage = lazy(() =>
  import('./features/dashboard/dashboard-page').then((m) => ({ default: m.DashboardPage })),
)
const SubjectsPage = lazy(() =>
  import('./features/subjects/subjects-page').then((m) => ({ default: m.SubjectsPage })),
)
const QuestionsPage = lazy(() =>
  import('./features/questions/questions-page').then((m) => ({ default: m.QuestionsPage })),
)
const PlannerPage = lazy(() =>
  import('./features/planner/planner-page').then((m) => ({ default: m.PlannerPage })),
)
const RevisionsPage = lazy(() =>
  import('./features/revisions/revisions-page').then((m) => ({ default: m.RevisionsPage })),
)
const ProjectsPage = lazy(() =>
  import('./features/projects/projects-page').then((m) => ({ default: m.ProjectsPage })),
)
const ResumePage = lazy(() =>
  import('./features/resume/resume-page').then((m) => ({ default: m.ResumePage })),
)
const AnalyticsPage = lazy(() =>
  import('./features/analytics/analytics-page').then((m) => ({ default: m.AnalyticsPage })),
)
const SettingsPage = lazy(() =>
  import('./features/settings/settings-page').then((m) => ({ default: m.SettingsPage })),
)
const NotFoundPage = lazy(() =>
  import('./features/not-found/not-found-page').then((m) => ({ default: m.NotFoundPage })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner className="h-6 w-6 text-coral" />
    </div>
  )
}

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="subjects" element={<SubjectsPage />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="revisions" element={<RevisionsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default App
