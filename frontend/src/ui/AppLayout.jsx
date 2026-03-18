import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { useTheme } from '../state/ThemeContext.jsx'
import { Badge, Button } from './components.jsx'

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-md border px-3 py-2 text-sm font-medium transition',
          isActive ? 'border-border bg-card' : 'border-border/60 bg-transparent hover:bg-card/70',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function AppLayout() {
  const { auth, isAuthed, logout } = useAuth()
  const navigate = useNavigate()
  const { toggle } = useTheme()

  return (
    <div className="min-h-screen bg-app">
      <header
        className="sticky top-0 z-10 border-b border-border bg-bg/70 backdrop-blur"
      >
        <div
          className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4"
        >
          <Link to="/" className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl border border-border bg-gradient-to-br from-primary to-emerald-400/70 shadow-soft" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Internship Progress Tracker</div>
              <div className="text-xs text-muted">Manager goals • Intern reports</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" onClick={toggle} type="button">
              Toggle theme
            </Button>
            {!isAuthed ? (
              <>
                <NavItem to="/login">Login</NavItem>
                <NavItem to="/register">Register</NavItem>
              </>
            ) : (
              <>
                <NavItem to={auth.role === 'manager' ? '/manager' : '/intern'}>Dashboard</NavItem>
                <Badge title={auth.email}>
                  {auth.role} • {auth.name}
                </Badge>
                <Button
                  variant="default"
                  onClick={() => {
                    logout()
                    navigate('/login', { replace: true })
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-bg/40">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 text-xs text-muted">
          <span>MERN • JWT • Quill reports</span>
          <span className="rounded-md border border-border bg-card px-2 py-1 font-mono">
            API: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}
          </span>
        </div>
      </footer>
    </div>
  )
}

