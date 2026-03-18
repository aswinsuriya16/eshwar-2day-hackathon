import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { getErrorMessage } from '../utils/api.js'
import { Badge, Button, Card, CardBody, CardHeader, Input, Label } from '../ui/components.jsx'

function Tab({ active, onClick, children }) {
  return (
    <Button variant={active ? 'primary' : 'default'} onClick={onClick} type="button">
      {children}
    </Button>
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
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="space-y-1">
          <div className="text-xl font-semibold tracking-tight">Login</div>
          <div className="text-sm text-muted">Choose your role and sign in.</div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex gap-2">
          <Tab active={role === 'manager'} onClick={() => setRole('manager')}>
            Manager
          </Tab>
          <Tab active={role === 'intern'} onClick={() => setRole('intern')}>
            Intern
          </Tab>
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
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
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                {error}
              </div>
            ) : null}

            <Button className="w-full" variant="primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : `Sign in as ${role}`}
            </Button>
          </form>

          <div className="text-sm text-muted">
            Don’t have an account?{' '}
            <Link to="/register" className="font-medium text-fg underline underline-offset-4">
              Register
            </Link>
            .
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="default">JWT</Badge>
            <span className="text-xs text-muted">Redirect: {redirectTo}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

