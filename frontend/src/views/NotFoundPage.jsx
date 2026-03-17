import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="card">
      <div className="cardBody" style={{ display: 'grid', gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Page not found</div>
        <div className="muted">The page you’re looking for doesn’t exist.</div>
        <div>
          <Link className="btn" to="/">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

