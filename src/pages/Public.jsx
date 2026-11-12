import { ClipboardList, CheckCircle2, Clock, Timer } from 'lucide-react'
import { api } from '../services/api'
import { useApi } from '../lib/hooks'
import { Loading, PageHeader, Stat } from '../components/ui'
import { MonthlyChart, Donut, HBars } from '../components/charts'
import { ComplaintMap } from '../components/maps'
import { catOf, STATUS_COLOR } from '../lib/constants'
import { timeAgo } from '../lib/format'
import ScoreInfo from '../components/ScoreInfo'

export default function Public() {
  const ov = useApi(() => api.overview())
  if (!ov) return <Loading />
  const scoreData = ov.deptScores.map((d) => ({ name: d.name.split(' ').slice(0, 2).join(' '), value: d.score })).sort((a, b) => b.value - a.value)
  const geo = ov.geo.map((g) => ({ ...g, description: '', address: '', createdAt: 0 }))
  return (
    <div>
      <PageHeader title="Public accountability dashboard" sub="Live figures from every complaint on CivicLoop. No personal information is shown." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Complaints reported" value={ov.total} icon={ClipboardList} />
        <Stat label="Resolved" value={ov.resolved} icon={CheckCircle2} tone="#16A34A" />
        <Stat label="Pending or in progress" value={ov.pending + ov.inProgress + ov.reopened} icon={Clock} tone="#D97706" />
        <Stat label="Average resolution time" value={ov.avgDays != null ? `${ov.avgDays} d` : '—'} icon={Timer} tone="#0284C7" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="mb-2 text-lg font-bold">Monthly complaint trend</h2><MonthlyChart data={ov.monthly} /></section>
        <section className="card p-5"><h2 className="mb-2 text-lg font-bold">Complaints by category</h2><Donut data={ov.byCategory} /></section>
        <section className="card p-5">
          <h2 className="mb-2 text-lg font-bold">Department performance score</h2>
          <HBars data={scoreData} max={100} height={220} />
          <ScoreInfo />
        </section>
        <section className="card p-5">
          <h2 className="mb-3 text-lg font-bold">Latest status changes</h2>
          <ul className="divide-y divide-line text-sm">
            {ov.feed.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                <span><b>{f.id}</b> · {catOf(f.category).short}</span>
                <span className="flex items-center gap-2"><span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: STATUS_COLOR[f.status] + '18', color: STATUS_COLOR[f.status] }}>{f.status}</span><span className="text-xs text-slate-500">{timeAgo(f.at)}</span></span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="card mt-6 p-5">
        <h2 className="mb-3 text-lg font-bold">Where issues are reported</h2>
        <ComplaintMap complaints={geo} height={400} detail={false} />
      </section>
    </div>
  )
}
