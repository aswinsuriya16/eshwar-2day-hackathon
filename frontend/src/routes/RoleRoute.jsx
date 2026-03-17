import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export function RoleRoute({ role, children }) {
  const { auth } = useAuth()

  if (!auth?.role) return <Navigate to="/login" replace />
  if (auth.role !== role) return <Navigate to={auth.role === 'manager' ? '/manager' : '/intern'} replace />

  return children
}

