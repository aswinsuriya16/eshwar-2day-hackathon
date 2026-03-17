import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { getErrorMessage } from '../utils/api.js'

function Tab({ active, onClick, children }) {
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
        borderColor: active ? 'rgba(139,92,246,0.55)' : 'rgba(255,255,255,0.12)',
      }}
      type="button"
    >
      {children}
    </button>
  )
}

export function LoginPage() {
  const { isAuthed, auth, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [role, setRole] = useState('manager')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = useMemo(() => {
    const from = location.state?.from
    if (typeof from === 'string' && from.startsWith('/')) return from
    return role === 'manager' ? '/manager' : '/intern'
  }, [location.state?.from, role])

  if (isAuthed) {
    return <Navigate to={auth.role === 'manager' ? '/manager' : '/intern'} replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const next = await login(role, { email, password })
      navigate(next.role === 'manager' ? '/manager' : '/intern', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="cardHeader" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Login</div>
        <div className="muted">Choose your role and sign in.</div>
      </div>
      <div className="cardBody" style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Tab active={role === 'manager'} onClick={() => setRole('manager')}>
            Manager
          </Tab>
          <Tab active={role === 'intern'} onClick={() => setRole('intern')}>
            Intern
          </Tab>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <label className="muted" style={{ fontSize: 13 }}>
              Email
            </label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <label className="muted" style={{ fontSize: 13 }}>
              Password
            </label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </div>

          {error ? (
            <div className="card" style={{ padding: 12, borderColor: 'rgba(255,92,119,0.45)', background: 'rgba(255,92,119,0.10)' }}>
              {error}
            </div>
          ) : null}

          <button className="btn btnPrimary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : `Sign in as ${role}`}
          </button>
        </form>

        <div className="muted" style={{ fontSize: 14 }}>
          Don’t have an account?{' '}
          <Link to="/register" style={{ textDecoration: 'underline' }}>
            Register
          </Link>
          .
        </div>
      </div>
    </div>
  )
}

