import { useEffect, useMemo, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { api, getErrorMessage } from '../../utils/api.js'
import { Badge, Button, Card, CardBody, CardHeader, Input, Label, Select } from '../../ui/components.jsx'

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

export function InternDashboard() {
  const [goals, setGoals] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('goals') // goals | submit | reports

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
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold tracking-tight">Intern Dashboard</div>
          <div className="text-sm text-muted">
            Switch between goals, submitting reports, and your history.
          </div>
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

      <div className="flex gap-2 rounded-lg border border-border bg-card px-2 py-1 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('goals')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            activeTab === 'goals'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted hover:bg-muted'
          }`}
        >
          View goals
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('submit')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            activeTab === 'submit'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted hover:bg-muted'
          }`}
        >
          Submit report
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium ${
            activeTab === 'reports'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted hover:bg-muted'
          }`}
        >
          My reports
        </button>
      </div>

      {activeTab === 'goals' && (
        <Section
          title="Your weekly goals"
          subtitle="GET /api/interns/goals"
          right={<Badge>{goals.length} goals</Badge>}
        >
        {loading ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : goals.length === 0 ? (
          <div className="text-sm text-muted">No goals assigned yet.</div>
        ) : (
          <div className="grid gap-3">
            {goals.map((g) => (
              <div
                key={g._id}
                className={`cursor-pointer rounded-lg border px-3 py-2 ${
                  g._id === selectedGoalId ? 'border-ring bg-primary/5' : 'border-border bg-card'
                }`}
                onClick={() => setSelectedGoalId(g._id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">{g.title}</div>
                    <div className="text-xs text-muted">
                      week {formatDate(g.weekStart)} • deadline {formatDate(g.deadline)} • priority {g.priority}
                    </div>
                  </div>
                  <Badge className="text-[11px]">
                    {reportGoalIds.has(g._id) ? 'reported' : 'not reported'}
                  </Badge>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-xs text-muted">
                  {g.description}
                </div>
              </div>
            ))}
          </div>
        )}
        </Section>
      )}

      {activeTab === 'submit' && (
        <Section
          title="Submit report"
          subtitle="POST /api/interns/reports (Quill HTML)"
          right={
            selectedGoal ? (
              <Badge title={selectedGoal._id}>
                goal: {selectedGoal.title}
              </Badge>
            ) : null
          }
        >
        {goals.length === 0 ? (
          <div className="text-sm text-muted">Once you have a goal, you can submit a report here.</div>
        ) : (
          <form onSubmit={submitReport} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Selected goal</Label>
              <Select value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)}>
                {goals.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.title}
                  </option>
                ))}
              </Select>
            </div>

            {alreadySubmitted ? (
              <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm">
                You already submitted a report for this goal.
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label>Report content</Label>
              <ReactQuill theme="snow" value={content} onChange={setContent} />
            </div>

            {submitMsg ? (
              <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                {submitMsg}
              </div>
            ) : null}

            <Button variant="primary" type="submit" disabled={submitting || alreadySubmitted || !content.trim()}>
              {submitting ? 'Submitting…' : 'Submit report'}
            </Button>
          </form>
        )}
      </Section>
      )}

      {activeTab === 'reports' && (
        <Section
          title="My submitted reports"
          subtitle="GET /api/interns/reports"
          right={<Badge>{reports.length} reports</Badge>}
        >
        {loading ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : reports.length === 0 ? (
          <div className="text-sm text-muted">No reports submitted yet.</div>
        ) : (
          <div className="grid gap-3">
            {reports.map((r) => (
              <div
                key={r._id}
                className="rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">{r.weeklyGoal?.title || 'Weekly goal'}</div>
                    <div className="text-xs text-muted">
                      submitted {formatDate(r.submittedAt || r.createdAt)} • week {formatDate(r.weeklyGoal?.weekStart)}
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                {r.feedback ? (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs text-muted">
                      Feedback
                    </div>
                    <div className="rounded-lg border border-border bg-card/70 px-3 py-2 text-sm">
                      {r.feedback}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Section>
      )}
    </div>
  )
}

