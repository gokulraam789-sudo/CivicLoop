import { useState } from 'react'
import { api } from '../../services/api'
import { useApi } from '../../lib/hooks'
import { useAuth } from '../../context/AuthContext'
import { Field, Filters, Loading, PageHeader } from '../../components/ui'
import ComplaintTable from '../../components/ComplaintTable'
import { CATEGORIES, STATUSES } from '../../lib/constants'
import { DAY } from '../../lib/format'

export default function DeptComplaints() {
  const { user } = useAuth()
  const [f, setF] = useState({ q: '', category: '', status: '', range: '' })
  const rows = useApi(() => api.listComplaints({ deptId: user.departmentId, q: f.q, category: f.category, status: f.status, from: f.range ? Date.now() - +f.range * DAY : undefined }), [f.q, f.category, f.status, f.range])
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  return (
    <div>
      <PageHeader title="Complaint queue" sub="Reopened and overdue complaints need action first." />
      <Filters>
        <Field label="Search ID or location"><input className="input" value={f.q} onChange={set('q')} placeholder="CL-2026-0001" /></Field>
        <Field label="Category"><select className="input" value={f.category} onChange={set('category')}><option value="">All</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.short}</option>)}</select></Field>
        <Field label="Status"><select className="input" value={f.status} onChange={set('status')}><option value="">All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Submitted"><select className="input" value={f.range} onChange={set('range')}><option value="">Any time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></Field>
      </Filters>
      {!rows ? <Loading /> : <ComplaintTable rows={[...rows].sort((a, b) => (a.status === 'Resolved') - (b.status === 'Resolved') || (a.deadline || 0) - (b.deadline || 0))} />}
    </div>
  )
}
