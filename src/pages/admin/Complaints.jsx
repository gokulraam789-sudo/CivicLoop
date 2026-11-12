import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import { useApi } from '../../lib/hooks'
import { useAuth } from '../../context/AuthContext'
import { Alert, Empty, Field, Filters, Loading, PageHeader, StatusBadge, Tabs } from '../../components/ui'
import ComplaintTable from '../../components/ComplaintTable'
import { CATEGORIES, STATUSES } from '../../lib/constants'
import { DAY, fmtDate } from '../../lib/format'

export default function AdminComplaints() {
  const { user } = useAuth()
  const [tab, setTab] = useState('all')
  const [f, setF] = useState({ q: '', category: '', deptId: '', status: '', range: '', overdue: false })
  const [err, setErr] = useState('')
  const rows = useApi(() => api.listComplaints({ q: f.q, category: f.category, deptId: f.deptId, status: f.status, overdue: f.overdue, from: f.range ? Date.now() - +f.range * DAY : undefined }), [f.q, f.category, f.deptId, f.status, f.range, f.overdue])
  const depts = useApi(() => api.listDepartments())
  const groups = useApi(() => api.duplicateGroups())
  const settings = useApi(() => api.getSettings())
  const [radius, setRadius] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const assign = async (id, deptId) => { setErr(''); try { await api.assign(id, deptId, user) } catch (e) { setErr(e.message) } }
  return (
    <div>
      <PageHeader title="Complaint management" sub="Search, filter, assign and reassign. Changing a department updates the whole duplicate group." />
      <Tabs value={tab} onChange={setTab} tabs={[['all', 'All complaints'], ['dups', `Duplicate groups${groups ? ` (${groups.length})` : ''}`]]} />
      <Alert>{err}</Alert>
      {tab === 'all' && (
        <>
          <Filters>
            <Field label="Search ID or location"><input className="input" value={f.q} onChange={set('q')} placeholder="CL-2026-0001" /></Field>
            <Field label="Category"><select className="input" value={f.category} onChange={set('category')}><option value="">All</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.short}</option>)}</select></Field>
            <Field label="Department"><select className="input" value={f.deptId} onChange={set('deptId')}><option value="">All</option>{depts?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
            <Field label="Status"><select className="input" value={f.status} onChange={set('status')}><option value="">All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Submitted"><select className="input" value={f.range} onChange={set('range')}><option value="">Any time</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></Field>
            <label className="flex items-center gap-2 pb-2.5 text-sm font-medium"><input type="checkbox" checked={f.overdue} onChange={(e) => setF({ ...f, overdue: e.target.checked })} />Delayed only</label>
          </Filters>
          {!rows || !depts ? <Loading /> : <ComplaintTable rows={rows} showDept departments={depts} onAssign={assign} />}
        </>
      )}
      {tab === 'dups' && (
        <div className="space-y-4">
          <div className="card flex flex-wrap items-end gap-3 p-4">
            <Field label="Duplicate detection radius (metres)"><input type="number" min="10" max="1000" className="input !w-40" defaultValue={settings?.dupRadius} key={settings?.dupRadius} onChange={(e) => setRadius(e.target.value)} /></Field>
            <button className="btn btn-primary" onClick={() => radius && api.setRadius(radius, user)}>Save radius</button>
            <p className="text-sm text-slate-600">Same-category complaints within this distance are shown to citizens as possible duplicates.</p>
          </div>
          {!groups ? <Loading /> : !groups.length ? <Empty title="No duplicate groups">Groups appear when a citizen links a new report to an existing one.</Empty> : groups.map((g) => (
            <section key={g.main.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><Link to={`/complaints/${g.main.id}`} className="text-lg font-bold text-brand-700 hover:underline">{g.main.id}</Link><p className="text-sm text-slate-600">{g.main.address} · {g.main.affected} citizens affected</p></div><StatusBadge status={g.main.status} /></div>
              <ul className="mt-3 divide-y divide-line border-t border-line text-sm">
                {g.children.map((k) => <li key={k.id} className="flex justify-between py-2"><Link to={`/complaints/${k.id}`} className="font-semibold hover:underline">{k.id}</Link><span className="text-slate-500">{fmtDate(k.createdAt)} · {k.supportCount + 1} citizens</span></li>)}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
