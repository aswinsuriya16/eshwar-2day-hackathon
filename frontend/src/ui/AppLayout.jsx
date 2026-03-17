import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: '8px 10px',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.12)',
        background: isActive ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.86)',
        textDecoration: 'none',
      })}
    >
      {children}
    </NavLink>
  )
}

export function AppLayout() {
  const { auth, isAuthed, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(12px)',
          background: 'rgba(11,16,32,0.55)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 0',
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.95), rgba(45,212,191,0.65))',
                border: '1px solid rgba(255,255,255,0.18)',
                display: 'inline-block',
              }}
            />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>Internship Progress Tracker</div>
              <div className="muted" style={{ fontSize: 13 }}>
                Manager goals • Intern reports
              </div>
            </div>
          </Link>

          <nav style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!isAuthed ? (
              <>
                <NavItem to="/login">Login</NavItem>
                <NavItem to="/register">Register</NavItem>
              </>
            ) : (
              <>
                <NavItem to={auth.role === 'manager' ? '/manager' : '/intern'}>Dashboard</NavItem>
                <span className="pill" title={auth.email}>
                  {auth.role} • {auth.name}
                </span>
                <button
                  className="btn"
                  onClick={() => {
                    logout()
                    navigate('/login', { replace: true })
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, padding: '28px 0 44px' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer style={{ padding: '14px 0 22px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span className="muted" style={{ fontSize: 13 }}>
            MERN • JWT • Quill reports
          </span>
          <span className="muted" style={{ fontSize: 13 }}>
            API: <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 8 }}>
              {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}
            </code>
          </span>
        </div>
      </footer>
    </div>
  )
}

