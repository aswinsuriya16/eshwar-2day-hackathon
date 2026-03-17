import { useEffect, useMemo, useState } from 'react'
import { api, getErrorMessage } from '../../utils/api.js'

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString()
}

function StatusPill({ status }) {
  if (status === 'approved') return <span className="pill ok">approved</span>
  if (status === 'rejected') return <span className="pill bad">rejected</span>
  return <span className="pill warn">pending</span>
}

function Section({ title, subtitle, right, children }) {
  return (
    <div className="card">
      <div className="cardHeader" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
          {subtitle ? <div className="muted" style={{ fontSize: 13 }}>{subtitle}</div> : null}
        </div>
        {right}
      </div>
      <div className="cardBody">{children}</div>
    </div>
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
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.3 }}>Manager Dashboard</div>
          <div className="muted">Assign weekly goals and review intern reports.</div>
        </div>
        <button className="btn" onClick={loadAll} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="card" style={{ padding: 12, borderColor: 'rgba(255,92,119,0.45)', background: 'rgba(255,92,119,0.10)' }}>
          {error}
        </div>
      ) : null}

      <Section
        title="Your interns"
        subtitle="Fetched from /api/managers/interns"
        right={<span className="pill">{interns.length} interns</span>}
      >
        {loading ? (
          <div className="muted">Loading…</div>
        ) : interns.length === 0 ? (
          <div className="muted">
            No interns found. Interns must register with your managerId.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {interns.map((i) => (
              <div
                key={i._id}
                className="card"
                style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'grid', gap: 2 }}>
                    <div style={{ fontWeight: 800 }}>{i.name}</div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {i.email} • start {formatDate(i.startDate)}
                    </div>
                  </div>
                  <span className="pill" title={i._id}>
                    id: {String(i._id).slice(0, 8)}…
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Assign weekly goal" subtitle="POST /api/managers/goals">
        <form onSubmit={submitGoal} style={{ display: 'grid', gap: 12 }}>
          <div className="grid2">
            <div style={{ display: 'grid', gap: 6 }}>
              <label className="muted" style={{ fontSize: 13 }}>
                Assign to intern
              </label>
              <select
                className="select"
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
              </select>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <label className="muted" style={{ fontSize: 13 }}>
                Priority
              </label>
              <select
                className="select"
                value={goalForm.priority}
                onChange={(e) => setGoalForm((s) => ({ ...s, priority: e.target.value }))}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
          </div>

          <div className="grid2">
            <div style={{ display: 'grid', gap: 6 }}>
              <label className="muted" style={{ fontSize: 13 }}>
                Week start
              </label>
              <input
                className="input"
                type="date"
                value={goalForm.weekStart}
                onChange={(e) => setGoalForm((s) => ({ ...s, weekStart: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <label className="muted" style={{ fontSize: 13 }}>
                Deadline
              </label>
              <input
                className="input"
                type="date"
                value={goalForm.deadline}
                onChange={(e) => setGoalForm((s) => ({ ...s, deadline: e.target.value }))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label className="muted" style={{ fontSize: 13 }}>
              Title
            </label>
            <input
              className="input"
              value={goalForm.title}
              onChange={(e) => setGoalForm((s) => ({ ...s, title: e.target.value }))}
              placeholder="e.g., Build API integration"
              required
            />
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label className="muted" style={{ fontSize: 13 }}>
              Description
            </label>
            <textarea
              className="textarea"
              value={goalForm.description}
              onChange={(e) => setGoalForm((s) => ({ ...s, description: e.target.value }))}
              placeholder="Goal details, acceptance criteria, links…"
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label className="muted" style={{ fontSize: 13 }}>
              Expected metrics (optional)
            </label>
            <textarea
              className="textarea"
              value={goalForm.expectedMetrics}
              onChange={(e) => setGoalForm((s) => ({ ...s, expectedMetrics: e.target.value }))}
              placeholder="e.g., 3 PRs merged, 1 demo video…"
              rows={2}
            />
          </div>

          {goalMsg ? (
            <div className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.04)' }}>
              {goalMsg}
            </div>
          ) : null}

          <button className="btn btnPrimary" type="submit" disabled={goalSubmitting || internOptions.length === 0}>
            {goalSubmitting ? 'Assigning…' : 'Assign goal'}
          </button>
        </form>
      </Section>

      <Section
        title="Pending reports"
        subtitle="GET /api/managers/reports/pending (global pending list)"
        right={<span className="pill">{pending.length} pending</span>}
      >
        {loading ? (
          <div className="muted">Loading…</div>
        ) : pending.length === 0 ? (
          <div className="muted">No pending reports.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {pending.map((r) => (
              <div
                key={r._id}
                className="card"
                style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'grid', gap: 2 }}>
                    <div style={{ fontWeight: 850 }}>
                      {r.weeklyGoal?.title || 'Weekly goal'} <span className="muted" style={{ fontWeight: 500 }}>• {formatDate(r.weeklyGoal?.weekStart)}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      Intern: {r.intern?.name || '—'} ({r.intern?.email || '—'})
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <StatusPill status={r.status} />
                    <button className="btn btnPrimary" onClick={() => openReview(r)}>
                      Review
                    </button>
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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'grid',
            placeItems: 'center',
            padding: 16,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setReviewing(null)
          }}
        >
          <div className="card" style={{ width: 'min(980px, 100%)', maxHeight: '85vh', overflow: 'auto' }}>
            <div className="cardHeader" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div style={{ display: 'grid', gap: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 850 }}>{reviewing.weeklyGoal?.title || 'Report'}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {reviewing.intern?.name} • {reviewing.intern?.email} • submitted {formatDate(reviewing.submittedAt || reviewing.createdAt)}
                </div>
              </div>
              <button className="btn" onClick={() => setReviewing(null)}>
                Close
              </button>
            </div>
            <div className="cardBody" style={{ display: 'grid', gap: 12 }}>
              <div className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.04)' }}>
                <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>
                  Report content (HTML)
                </div>
                <div
                  style={{
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    padding: 12,
                    background: 'rgba(0,0,0,0.20)',
                    overflowX: 'auto',
                  }}
                  dangerouslySetInnerHTML={{ __html: reviewing.content || '<p>(empty)</p>' }}
                />
              </div>

              <div className="grid2">
                <div style={{ display: 'grid', gap: 6 }}>
                  <label className="muted" style={{ fontSize: 13 }}>
                    Action
                  </label>
                  <select className="select" value={reviewAction} onChange={(e) => setReviewAction(e.target.value)}>
                    <option value="approve">approve</option>
                    <option value="reject">reject</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label className="muted" style={{ fontSize: 13 }}>
                    Rating (approve only)
                  </label>
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={10}
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    disabled={reviewAction !== 'approve'}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label className="muted" style={{ fontSize: 13 }}>
                  Feedback {reviewAction === 'reject' ? '(required for reject)' : '(optional)'}
                </label>
                <textarea
                  className="textarea"
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  rows={3}
                  required={reviewAction === 'reject'}
                  placeholder="Write feedback for the intern…"
                />
              </div>

              {reviewError ? (
                <div className="card" style={{ padding: 12, borderColor: 'rgba(255,92,119,0.45)', background: 'rgba(255,92,119,0.10)' }}>
                  {reviewError}
                </div>
              ) : null}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setReviewing(null)} disabled={reviewSubmitting}>
                  Cancel
                </button>
                <button
                  className={reviewAction === 'reject' ? 'btn btnDanger' : 'btn btnPrimary'}
                  onClick={submitReview}
                  disabled={reviewSubmitting || (reviewAction === 'reject' && !reviewFeedback.trim())}
                  type="button"
                >
                  {reviewSubmitting ? 'Submitting…' : reviewAction === 'reject' ? 'Reject' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

