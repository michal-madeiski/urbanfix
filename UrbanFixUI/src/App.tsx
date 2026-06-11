import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute'
import { AdminCallbackPage } from './pages/AdminCallbackPage'
import { AdminLayout } from './pages/AdminLayout'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminReportsPage } from './pages/AdminReportsPage'
import { AdminTeamsPage } from './pages/AdminTeamsPage'
import { SubmitReportPage } from './pages/SubmitReportPage'
import { TrackReportPage } from './pages/TrackReportPage'

function App() {
  return (
    <Routes>
      <Route element={<SubmitReportPage />} path="/" />
      <Route element={<TrackReportPage />} path="/status" />
      <Route element={<AdminLoginPage />} path="/admin/login" />
      <Route element={<AdminCallbackPage />} path="/admin/callback" />
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />} path="/admin">
          <Route element={<Navigate replace to="/admin/reports" />} index />
          <Route element={<AdminReportsPage />} path="reports" />
          <Route element={<AdminTeamsPage />} path="teams" />
        </Route>
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}

export default App
