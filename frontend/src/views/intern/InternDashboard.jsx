import { useEffect, useMemo, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
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

export function InternDashboard() {
  const [goals, setGoals] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  async function loadAll() {
    setError('')
    setLoading(true)
    try {
      const [gRes, rRes] = await Promise.all([api.get('/interns/goals'), api.get('/interns/reports')])
      const nextGoals = Array.isArray(gRes.data) ? gRes.data : []
      const nextReports = Array.isArray(rRes.data) ? rRes.data : []
      setGoals(nextGoals)
      setReports(nextReports)
      if (!selectedGoalId && nextGoals[0]?._id) {
        setSelectedGoalId(nextGoals[0]._id)
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

  const reportGoalIds = useMemo(() => new Set(reports.map((r) => r.weeklyGoal?._id || r.weeklyGoal)), [reports])

  const selectedGoal = useMemo(() => goals.find((g) => g._id === selectedGoalId) || null, [goals, selectedGoalId])
  const alreadySubmitted = useMemo(() => (selectedGoal?._id ? reportGoalIds.has(selectedGoal._id) : false), [reportGoalIds, selectedGoal?._id])

  async function submitReport(e) {
    e.preventDefault()
    setSubmitMsg('')
    if (!selectedGoalId) return
    setSubmitting(true)
    try {
      await api.post('/interns/reports', {
        weeklyGoalId: selectedGoalId,
        content,
      })
      setSubmitMsg('Report submitted successfully.')
      setContent('')
      await loadAll()
    } catch (err) {
      setSubmitMsg(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.3 }}>Intern Dashboard</div>
          <div className="muted">View weekly goals and submit rich-text progress reports.</div>
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
        title="Your weekly goals"
        subtitle="GET /api/interns/goals"
        right={<span className="pill">{goals.length} goals</span>}
      >
        {loading ? (
          <div className="muted">Loading…</div>
        ) : goals.length === 0 ? (
          <div className="muted">No goals assigned yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {goals.map((g) => (
              <div
                key={g._id}
                className="card"
                style={{
                  padding: 12,
                  background: g._id === selectedGoalId ? 'rgba(139,92,246,0.10)' : 'rgba(255,255,255,0.04)',
                  borderColor: g._id === selectedGoalId ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.10)',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedGoalId(g._id)}
                role="button"
                tabIndex={0}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'grid', gap: 4 }}>
                    <div style={{ fontWeight: 850 }}>{g.title}</div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      week {formatDate(g.weekStart)} • deadline {formatDate(g.deadline)} • priority {g.priority}
                    </div>
                  </div>
                  <span className="pill" style={{ fontSize: 12 }}>
                    {reportGoalIds.has(g._id) ? 'reported' : 'not reported'}
                  </span>
                </div>
                <div className="muted" style={{ marginTop: 8, fontSize: 14, whiteSpace: 'pre-wrap' }}>
                  {g.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Submit report"
        subtitle="POST /api/interns/reports (Quill HTML)"
        right={
          selectedGoal ? (
            <span className="pill" title={selectedGoal._id}>
              goal: {selectedGoal.title}
            </span>
          ) : null
        }
      >
        {goals.length === 0 ? (
          <div className="muted">Once you have a goal, you can submit a report here.</div>
        ) : (
          <form onSubmit={submitReport} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <label className="muted" style={{ fontSize: 13 }}>
                Selected goal
              </label>
              <select className="select" value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)}>
                {goals.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            {alreadySubmitted ? (
              <div className="card" style={{ padding: 12, background: 'rgba(250,204,21,0.10)', borderColor: 'rgba(250,204,21,0.30)' }}>
                You already submitted a report for this goal.
              </div>
            ) : null}

            <div style={{ display: 'grid', gap: 6 }}>
              <label className="muted" style={{ fontSize: 13 }}>
                Report content
              </label>
              <ReactQuill theme="snow" value={content} onChange={setContent} />
            </div>

            {submitMsg ? (
              <div className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.04)' }}>
                {submitMsg}
              </div>
            ) : null}

            <button className="btn btnPrimary" type="submit" disabled={submitting || alreadySubmitted || !content.trim()}>
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
          </form>
        )}
      </Section>

      <Section
        title="My submitted reports"
        subtitle="GET /api/interns/reports"
        right={<span className="pill">{reports.length} reports</span>}
      >
        {loading ? (
          <div className="muted">Loading…</div>
        ) : reports.length === 0 ? (
          <div className="muted">No reports submitted yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {reports.map((r) => (
              <div
                key={r._id}
                className="card"
                style={{ padding: 12, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.10)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'grid', gap: 2 }}>
                    <div style={{ fontWeight: 850 }}>{r.weeklyGoal?.title || 'Weekly goal'}</div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      submitted {formatDate(r.submittedAt || r.createdAt)} • week {formatDate(r.weeklyGoal?.weekStart)}
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                {r.feedback ? (
                  <div style={{ marginTop: 10 }}>
                    <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
                      Feedback
                    </div>
                    <div className="card" style={{ padding: 10, background: 'rgba(255,255,255,0.03)' }}>
                      {r.feedback}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

