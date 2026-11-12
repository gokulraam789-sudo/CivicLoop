import { Link } from 'react-router-dom'
import { ClipboardList, Clock, CheckCircle2, RotateCcw, BellRing } from 'lucide-react'
import { api } from '../../services/api'
import { useApi } from '../../lib/hooks'
import { useAuth } from '../../context/AuthContext'
import { Loading, PageHeader, Stat, StatusBadge, Alert, Empty } from '../../components/ui'
import { GROUPS } from '../../lib/constants'
import { timeAgo } from '../../lib/format'

export default function CitizenDashboard() {
  const { user } = useAuth()
  const mine = useApi(() => api.listComplaints({ citizenId: user.id }), [user.id])
  const notes = useApi(() => api.notifications(user.id), [user.id])
  if (!mine) return <Loading />
  const n = (g) => mine.filter((c) => GROUPS[g].includes(c.status)).length
  const verify = mine.filter((c) => c.status === 'Resolution Submitted')
  return (
    <div>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} sub="Your reports, and what needs your attention.">
        <Link to="/citizen/report" className="btn btn-primary">Report an issue</Link>
      </PageHeader>
      {verify.length > 0 && (
        <div className="mb-6 space-y-2">
          {verify.map((c) => (
            <Link key={c.id} to={`/complaints/${c.id}`} className="block"><Alert tone="info"><span><b>{c.id}</b> at {c.address}: the department says the work is done. <u>Check the photos and confirm</u>.</span></Alert></Link>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total reported" value={mine.length} icon={ClipboardList} />
        <Stat label="Pending or in progress" value={n('pending') + n('progress')} icon={Clock} tone="#D97706" />
        <Stat label="Resolved" value={n('resolved')} icon={CheckCircle2} tone="#16A34A" />
        <Stat label="Reopened" value={n('reopened')} icon={RotateCcw} tone="#DC2626" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><BellRing size={18} />Status updates</h2>
          {!notes?.length ? <p className="text-sm text-slate-600">No updates yet.</p> : (
            <ul className="divide-y divide-line text-sm">
              {notes.map((x) => <li key={x.id} className="py-2.5"><Link to={`/complaints/${x.complaintId}`} className="hover:underline">{x.message}</Link><span className="ml-2 text-xs text-slate-500">{timeAgo(x.at)}</span></li>)}
            </ul>
          )}
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Recent complaints</h2>
          {!mine.length ? <Empty title="Nothing reported yet">Spot a problem on your street? Report it in under a minute.</Empty> : (
            <ul className="divide-y divide-line text-sm">
              {mine.slice(0, 5).map((c) => <li key={c.id} className="flex items-center justify-between py-2.5"><Link to={`/complaints/${c.id}`} className="font-semibold text-brand-700 hover:underline">{c.id}</Link><span className="mx-2 flex-1 truncate text-slate-600">{c.address}</span><StatusBadge status={c.status} /></li>)}
            </ul>
          )}
          <Link to="/citizen/complaints" className="mt-3 inline-block text-sm font-semibold text-brand-700 underline">View all my complaints</Link>
        </section>
      </div>
    </div>
  )
}
