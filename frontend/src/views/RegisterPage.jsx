import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { getErrorMessage } from '../utils/api.js'
import { Button, Card, CardBody, CardHeader, Input, Label, Select } from '../ui/components.jsx'

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint ? (
        <div className="text-xs text-muted">{hint}</div>
      ) : null}
    </div>
  )
}

export function RegisterPage() {
  const { isAuthed, auth, register } = useAuth()
  const navigate = useNavigate()

  const [role, setRole] = useState('manager')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [common, setCommon] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [managerExtra, setManagerExtra] = useState({
    department: '',
    company: '',
  })

  const [internExtra, setInternExtra] = useState({
    managerId: '',
    startDate: '',
  })

  const internPayload = useMemo(() => {
    return {
      name: common.name,
      email: common.email,
      password: common.password,
      managerId: internExtra.managerId,
      startDate: internExtra.startDate,
    }
  }, [common, internExtra.managerId, internExtra.startDate])

  const managerPayload = useMemo(() => {
    return {
      name: common.name,
      email: common.email,
      password: common.password,
      department: managerExtra.department,
      company: managerExtra.company,
    }
  }, [common, managerExtra.company, managerExtra.department])

  if (isAuthed) {
    return <Navigate to={auth.role === 'manager' ? '/manager' : '/intern'} replace />
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = role === 'manager' ? managerPayload : internPayload
      const next = await register(role, payload)
      navigate(next.role === 'manager' ? '/manager' : '/intern', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader className="space-y-1">
          <div className="text-xl font-semibold tracking-tight">Register</div>
          <div className="text-sm text-muted">Create a Manager or Intern account.</div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="manager">Manager</option>
              <option value="intern">Intern</option>
            </Select>
          </Field>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Name">
                <Input
                  value={common.name}
                  onChange={(e) => setCommon((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </Field>
              <Field label="Email">
                <Input
                  value={common.email}
                  onChange={(e) => setCommon((s) => ({ ...s, email: e.target.value }))}
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </Field>
            </div>

            <Field label="Password" hint="Minimum 8 characters (backend requirement).">
              <Input
                value={common.password}
                onChange={(e) => setCommon((s) => ({ ...s, password: e.target.value }))}
                type="password"
                placeholder="••••••••"
                minLength={8}
                required
              />
            </Field>

            {role === 'manager' ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Department (optional)">
                  <Input
                    value={managerExtra.department}
                    onChange={(e) => setManagerExtra((s) => ({ ...s, department: e.target.value }))}
                    placeholder="Engineering"
                  />
                </Field>
                <Field label="Company (optional)">
                  <Input
                    value={managerExtra.company}
                    onChange={(e) => setManagerExtra((s) => ({ ...s, company: e.target.value }))}
                    placeholder="Acme Inc."
                  />
                </Field>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Manager ID" hint="Ask your manager for their MongoDB _id (required by backend).">
                  <Input
                    value={internExtra.managerId}
                    onChange={(e) => setInternExtra((s) => ({ ...s, managerId: e.target.value }))}
                    placeholder="65f1c3…"
                    required
                  />
                </Field>
                <Field label="Start date" hint="Format: YYYY-MM-DD">
                  <Input
                    value={internExtra.startDate}
                    onChange={(e) => setInternExtra((s) => ({ ...s, startDate: e.target.value }))}
                    type="date"
                    required
                  />
                </Field>
              </div>
            )}

            {error ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                {error}
              </div>
            ) : null}

            <Button className="w-full" variant="primary" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : `Create ${role} account`}
            </Button>
          </form>

          <div className="text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-fg underline underline-offset-4">
              Login
            </Link>
            .
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

