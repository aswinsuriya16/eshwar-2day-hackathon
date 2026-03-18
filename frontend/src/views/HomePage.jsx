import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import { Badge, Button, Card, CardBody, CardHeader } from '../ui/components.jsx'

export function HomePage() {
  const { isAuthed, auth } = useAuth()

  if (isAuthed) {
    return <Navigate to={auth.role === 'manager' ? '/manager' : '/intern'} replace />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge>React</Badge>
            <Badge>JWT</Badge>
            <Badge>Quill</Badge>
          </div>
          <div className="text-3xl font-semibold tracking-tight md:text-4xl">
            Weekly goals. Rich reports. Fast reviews.
          </div>
          <div className="text-sm text-muted">
            A clean portal for managers to assign goals and review progress, and for interns to submit reports.
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm font-semibold">For managers</div>
              <div className="mt-1 text-sm text-muted">
                Assign weekly goals, review pending reports, approve/reject with feedback and rating.
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/login">
                  <Button variant="primary">Login as Manager</Button>
                </Link>
                <Link to="/register">
                  <Button variant="default">Register</Button>
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-sm font-semibold">For interns</div>
              <div className="mt-1 text-sm text-muted">
                View goals, submit rich-text progress reports, and track submission status.
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/login">
                  <Button variant="default">Login as Intern</Button>
                </Link>
                <Link to="/register">
                  <Button variant="ghost">Register</Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted">
            New here?{' '}
            <Link to="/register" className="font-medium text-fg underline underline-offset-4">
              Create an account
            </Link>
            .
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-semibold">API endpoints used</div>
          <div className="text-xs text-muted">These are the exact backend routes the UI calls.</div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-2 text-sm">
            <div className="rounded-md border border-border bg-card px-3 py-2 font-mono text-xs text-muted">
              /api/managers/register, /api/managers/login
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2 font-mono text-xs text-muted">
              /api/interns/register, /api/interns/login
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2 font-mono text-xs text-muted">
              /api/managers/interns, /api/managers/goals, /api/managers/reports/pending, /api/managers/reports/:id/approve, /api/managers/reports/:id/reject
            </div>
            <div className="rounded-md border border-border bg-card px-3 py-2 font-mono text-xs text-muted">
              /api/interns/goals, /api/interns/reports
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

