import { useEffect, useMemo, useState } from 'react'
import { api, getErrorMessage } from '../../utils/api.js'
import { Badge, Button, Card, CardBody, CardHeader, Input, Label, Select, Textarea } from '../../ui/components.jsx'

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString()
}

function StatusPill({ status }) {
  if (status === 'approved') return <Badge variant="ok">approved</Badge>
  if (status === 'rejected') return <Badge variant="bad">rejected</Badge>
  return <Badge variant="warn">pending</Badge>
}

function Section({ title, subtitle, right, children }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle ? <div className="text-xs text-muted">{subtitle}</div> : null}
        </div>
        {right}
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  )
}

export function ManagerDashboard() {
  const [interns, setInterns] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [goalForm, setGoalForm] = useState({
    assignedTo: '',
    title: '',
    description: '',
    weekStart: '',
    deadline: '',
    priority: 'medium',
    expectedMetrics: '',
  })
  const [goalSubmitting, setGoalSubmitting] = useState(false)
  const [goalMsg, setGoalMsg] = useState('')

  const [reviewing, setReviewing] = useState(null) // report object
  const [reviewAction, setReviewAction] = useState('approve') // approve | reject
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  async function loadAll() {
    setError('')
    setLoading(true)
    try {
      const [internRes, pendingRes] = await Promise.all([
        api.get('/managers/interns'),
        api.get('/managers/reports/pending'),
      ])
      setInterns(Array.isArray(internRes.data) ? internRes.data : [])
      setPending(Array.isArray(pendingRes.data) ? pendingRes.data : [])
      if (!goalForm.assignedTo && Array.isArray(internRes.data) && internRes.data[0]?._id) {
        setGoalForm((s) => ({ ...s, assignedTo: internRes.data[0]._id }))
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const internOptions = useMemo(() => {
    return interns.map((i) => ({ id: i._id, label: `${i.name} (${i.email})` }))
  }, [interns])

  async function submitGoal(e) {
    e.preventDefault()
    setGoalMsg('')
    setGoalSubmitting(true)
    try {
      const payload = {
        title: goalForm.title,
        description: goalForm.description,
        assignedTo: goalForm.assignedTo,
        weekStart: goalForm.weekStart,
        deadline: goalForm.deadline,
        priority: goalForm.priority,
        expectedMetrics: goalForm.expectedMetrics,
      }
      await api.post('/managers/goals', payload)
      setGoalMsg('Goal assigned successfully.')
      setGoalForm((s) => ({ ...s, title: '', description: '', expectedMetrics: '' }))
    } catch (err) {
      setGoalMsg(getErrorMessage(err))
    } finally {
      setGoalSubmitting(false)
    }
  }

  function openReview(report) {
    setReviewing(report)
    setReviewAction('approve')
    setReviewFeedback('')
    setReviewRating(5)
    setReviewError('')
  }

  async function submitReview() {
    if (!reviewing?._id) return
    setReviewSubmitting(true)
    setReviewError('')
    try {
      if (reviewAction === 'approve') {
        await api.put(`/managers/reports/${reviewing._id}/approve`, {
          feedback: reviewFeedback,
          rating: reviewRating,
        })
      } else {
        await api.put(`/managers/reports/${reviewing._id}/reject`, {
          feedback: reviewFeedback,
        })
      }
      setReviewing(null)
      await loadAll()
    } catch (err) {
      setReviewError(getErrorMessage(err))
    } finally {
      setReviewSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Manager Dashboard</div>
          <div className="text-sm text-muted">Assign weekly goals and review intern reports.</div>
        </div>
        <Button onClick={loadAll} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      <Section
        title="Your interns"
        subtitle="Fetched from /api/managers/interns"
        right={<Badge>{interns.length} interns</Badge>}
      >
        {loading ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : interns.length === 0 ? (
          <div className="text-sm text-muted">
            No interns found. Interns must register with your managerId.
          </div>
        ) : (
          <div className="grid gap-3">
            {interns.map((i) => (
              <div
                key={i._id}
                className="rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">{i.name}</div>
                    <div className="text-xs text-muted">
                      {i.email} • start {formatDate(i.startDate)}
                    </div>
                  </div>
                  <Badge title={i._id}>
                    id: {String(i._id).slice(0, 8)}…
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Assign weekly goal" subtitle="POST /api/managers/goals">
        <form onSubmit={submitGoal} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Assign to intern</Label>
              <Select
                value={goalForm.assignedTo}
                onChange={(e) => setGoalForm((s) => ({ ...s, assignedTo: e.target.value }))}
                required
                disabled={internOptions.length === 0}
              >
                {internOptions.length === 0 ? (
                  <option value="">No interns available</option>
                ) : (
                  internOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))
                )}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={goalForm.priority}
                onChange={(e) => setGoalForm((s) => ({ ...s, priority: e.target.value }))}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Week start</Label>
              <Input
                type="date"
                value={goalForm.weekStart}
                onChange={(e) => setGoalForm((s) => ({ ...s, weekStart: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm((s) => ({ ...s, deadline: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={goalForm.title}
              onChange={(e) => setGoalForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="e.g., Build API integration"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={goalForm.description}
              onChange={(e) => setGoalForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="Goal details, acceptance criteria, links…"
              rows={4}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Expected metrics (optional)</Label>
            <Textarea
              value={goalForm.expectedMetrics}
              onChange={(e) => setGoalForm((s) => ({ ...s, expectedMetrics: e.target.value }))}
              placeholder="e.g., 3 PRs merged, 1 demo video…"
              rows={2}
            />
          </div>

          {goalMsg ? (
            <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
              {goalMsg}
            </div>
          ) : null}

          <Button variant="primary" type="submit" disabled={goalSubmitting || internOptions.length === 0}>
            {goalSubmitting ? 'Assigning…' : 'Assign goal'}
          </Button>
        </form>
      </Section>

      <Section
        title="Pending reports"
        subtitle="GET /api/managers/reports/pending (global pending list)"
        right={<Badge>{pending.length} pending</Badge>}
      >
        {loading ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : pending.length === 0 ? (
          <div className="text-sm text-muted">No pending reports.</div>
        ) : (
          <div className="grid gap-3">
            {pending.map((r) => (
              <div
                key={r._id}
                className="rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">
                      {r.weeklyGoal?.title || 'Weekly goal'}{' '}
                      <span className="text-xs font-normal text-muted">• {formatDate(r.weeklyGoal?.weekStart)}</span>
                    </div>
                    <div className="text-xs text-muted">
                      Intern: {r.intern?.name || '—'} ({r.intern?.email || '—'})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={r.status} />
                    <Button variant="primary" size="sm" onClick={() => openReview(r)}>
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {reviewing ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 grid place-items-center bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setReviewing(null)
          }}
        >
          <Card className="max-h-[85vh] w-full max-w-4xl overflow-auto">
            <CardHeader className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold">{reviewing.weeklyGoal?.title || 'Report'}</div>
                <div className="text-xs text-muted">
                  {reviewing.intern?.name} • {reviewing.intern?.email} • submitted {formatDate(reviewing.submittedAt || reviewing.createdAt)}
                </div>
              </div>
              <Button variant="ghost" onClick={() => setReviewing(null)}>
                Close
              </Button>
            </CardHeader>
            <CardBody className="space-y-3">
              <Card className="border-border bg-card/80 px-3 py-2">
                <div className="mb-1 text-xs text-muted">
                  Report content (HTML)
                </div>
                <div
                  className="max-h-72 overflow-auto rounded-md border border-border bg-bg px-3 py-2 text-sm"
                  dangerouslySetInnerHTML={{ __html: reviewing.content || '<p>(empty)</p>' }}
                />
              </Card>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Action</Label>
                  <Select value={reviewAction} onChange={(e) => setReviewAction(e.target.value)}>
                    <option value="approve">approve</option>
                    <option value="reject">reject</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Rating (approve only)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    disabled={reviewAction !== 'approve'}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Feedback {reviewAction === 'reject' ? '(required for reject)' : '(optional)'}</Label>
                <Textarea
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  rows={3}
                  required={reviewAction === 'reject'}
                  placeholder="Write feedback for the intern…"
                />
              </div>

              {reviewError ? (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
                  {reviewError}
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setReviewing(null)} disabled={reviewSubmitting}>
                  Cancel
                </Button>
                <Button
                  variant={reviewAction === 'reject' ? 'destructive' : 'primary'}
                  onClick={submitReview}
                  disabled={reviewSubmitting || (reviewAction === 'reject' && !reviewFeedback.trim())}
                  type="button"
                >
                  {reviewSubmitting ? 'Submitting…' : reviewAction === 'reject' ? 'Reject' : 'Approve'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

