import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { getErrorMessage } from '../utils/api.js'

function Field({ label, children, hint }) {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label className="muted" style={{ fontSize: 13 }}>
        {label}
      </label>
      {children}
      {hint ? (
        <div className="muted" style={{ fontSize: 12 }}>
          {hint}
        </div>
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
    <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div className="cardHeader" style={{ display: 'grid', gap: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Register</div>
        <div className="muted">Create a Manager or Intern account.</div>
      </div>
      <div className="cardBody" style={{ display: 'grid', gap: 14 }}>
        <Field label="Role">
          <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="manager">Manager</option>
            <option value="intern">Intern</option>
          </select>
        </Field>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
          <div className="grid2">
            <Field label="Name">
              <input
                className="input"
                value={common.name}
                onChange={(e) => setCommon((s) => ({ ...s, name: e.target.value }))}
                placeholder="Your name"
                required
              />
            </Field>
            <Field label="Email">
              <input
                className="input"
                value={common.email}
                onChange={(e) => setCommon((s) => ({ ...s, email: e.target.value }))}
                type="email"
                placeholder="you@example.com"
                required
              />
            </Field>
          </div>

          <Field label="Password" hint="Minimum 8 characters (backend requirement).">
            <input
              className="input"
              value={common.password}
              onChange={(e) => setCommon((s) => ({ ...s, password: e.target.value }))}
              type="password"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </Field>

          {role === 'manager' ? (
            <div className="grid2">
              <Field label="Department (optional)">
                <input
                  className="input"
                  value={managerExtra.department}
                  onChange={(e) => setManagerExtra((s) => ({ ...s, department: e.target.value }))}
                  placeholder="Engineering"
                />
              </Field>
              <Field label="Company (optional)">
                <input
                  className="input"
                  value={managerExtra.company}
                  onChange={(e) => setManagerExtra((s) => ({ ...s, company: e.target.value }))}
                  placeholder="Acme Inc."
                />
              </Field>
            </div>
          ) : (
            <div className="grid2">
              <Field label="Manager ID" hint="Ask your manager for their MongoDB _id (required by backend).">
                <input
                  className="input"
                  value={internExtra.managerId}
                  onChange={(e) => setInternExtra((s) => ({ ...s, managerId: e.target.value }))}
                  placeholder="65f1c3…"
                  required
                />
              </Field>
              <Field label="Start date" hint="Format: YYYY-MM-DD">
                <input
                  className="input"
                  value={internExtra.startDate}
                  onChange={(e) => setInternExtra((s) => ({ ...s, startDate: e.target.value }))}
                  type="date"
                  required
                />
              </Field>
            </div>
          )}

          {error ? (
            <div className="card" style={{ padding: 12, borderColor: 'rgba(255,92,119,0.45)', background: 'rgba(255,92,119,0.10)' }}>
              {error}
            </div>
          ) : null}

          <button className="btn btnPrimary" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : `Create ${role} account`}
          </button>
        </form>

        <div className="muted" style={{ fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ textDecoration: 'underline' }}>
            Login
          </Link>
          .
        </div>
      </div>
    </div>
  )
}

