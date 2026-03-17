import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export function HomePage() {
  const { isAuthed, auth } = useAuth()

  if (isAuthed) {
    return <Navigate to={auth.role === 'manager' ? '/manager' : '/intern'} replace />
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="card">
        <div className="cardHeader">
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Internship Progress Tracker</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.4 }}>Weekly goals. Rich reports. Fast reviews.</div>
        </div>
        <div className="cardBody">
          <div className="grid2">
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>For managers</div>
              <div className="muted" style={{ marginBottom: 12 }}>
                Assign weekly goals, review pending reports, approve/reject with feedback and rating.
              </div>
              <Link className="btn btnPrimary" to="/login" style={{ display: 'inline-block' }}>
                Login as Manager
              </Link>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>For interns</div>
              <div className="muted" style={{ marginBottom: 12 }}>
                View your goals, submit rich-text progress reports, and track status.
              </div>
              <Link className="btn" to="/login" style={{ display: 'inline-block' }}>
                Login as Intern
              </Link>
            </div>
          </div>
          <div style={{ marginTop: 14 }} className="muted">
            New here? <Link to="/register" style={{ textDecoration: 'underline' }}>Create an account</Link>.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardBody" style={{ textAlign: 'left' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Backend endpoints used</div>
          <div className="muted" style={{ display: 'grid', gap: 6 }}>
            <div>
              <code>/api/managers/register</code>, <code>/api/managers/login</code>
            </div>
            <div>
              <code>/api/interns/register</code>, <code>/api/interns/login</code>
            </div>
            <div>
              <code>/api/managers/interns</code>, <code>/api/managers/goals</code>, <code>/api/managers/reports/pending</code>,{' '}
              <code>/api/managers/reports/:id/approve</code>, <code>/api/managers/reports/:id/reject</code>
            </div>
            <div>
              <code>/api/interns/goals</code>, <code>/api/interns/reports</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

