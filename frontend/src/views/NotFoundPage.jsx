import { Link } from 'react-router-dom'
import { Button, Card, CardBody } from '../ui/components.jsx'

export function NotFoundPage() {
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="text-xl font-semibold tracking-tight">Page not found</div>
        <div className="text-sm text-muted">The page you’re looking for doesn’t exist.</div>
        <div>
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  )
}

