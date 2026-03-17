import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute.jsx'
import { RoleRoute } from './routes/RoleRoute.jsx'
import { AppLayout } from './ui/AppLayout.jsx'
import { HomePage } from './views/HomePage.jsx'
import { LoginPage } from './views/LoginPage.jsx'
import { RegisterPage } from './views/RegisterPage.jsx'
import { ManagerDashboard } from './views/manager/ManagerDashboard.jsx'
import { InternDashboard } from './views/intern/InternDashboard.jsx'
import { NotFoundPage } from './views/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/manager"
            element={
              <RoleRoute role="manager">
                <ManagerDashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/intern"
            element={
              <RoleRoute role="intern">
                <InternDashboard />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
