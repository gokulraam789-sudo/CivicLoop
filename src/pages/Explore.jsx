import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { api } from '../services/api'
import { useApi } from '../lib/hooks'
import { useAuth } from '../context/AuthContext'
import { ComplaintMap } from '../components/maps'
import { Loading, PageHeader, Filters, Field, StatusBadge, CategoryTag, Alert } from '../components/ui'
import { CATEGORIES, STATUSES } from '../lib/constants'
import { fmtDate } from '../lib/format'

export default function Explore() {
  const { user } = useAuth()
  const [f, setF] = useState({ category: '', status: '' })
  const [msg, setMsg] = useState('')
  const rows = useApi(() => api.listComplaints(f), [f.category, f.status])
  const support = async (id) => {
    setMsg('')
    try { await api.support(id, user); setMsg(`Thanks. You are now counted as affected by ${id}.`) } catch (e) { setMsg(e.message) }
  }
  return (
    <div>
      <PageHeader title="Explore reported issues" sub="Larger markers mean more citizens are affected. Colour shows the current status." />
      <Filters>
        <Field label="Category"><select className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
        <Field label="Status"><select className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
      </Filters>
      {!rows ? <Loading /> : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><ComplaintMap complaints={rows} height={560} /></div>
          <div className="space-y-3 lg:max-h-[560px] lg:overflow-auto">
            <Alert tone="info">{msg}</Alert>
            <p className="text-sm text-slate-600">{rows.length} complaints</p>
            {rows.filter((c) => !c.parentId).map((c) => (
              <div key={c.id} className="card p-3 text-sm">
                <div className="flex items-center justify-between gap-2"><Link to={`/complaints/${c.id}`} className="font-bold text-brand-700 hover:underline">{c.id}</Link><StatusBadge status={c.status} /></div>
                <div className="mt-1"><CategoryTag id={c.category} /></div>
                <p className="mt-1 truncate text-slate-600" title={c.address}>{c.address}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{fmtDate(c.createdAt)} · <Users size={12} className="inline" /> {c.affected} affected</span>
                  {user?.role === 'citizen' && c.status !== 'Resolved' && <button className="btn btn-outline btn-sm" onClick={() => support(c.id)}>I am affected too</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
