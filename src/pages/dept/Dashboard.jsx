import { Link } from 'react-router-dom'
import { ClipboardList, Clock, Wrench, CheckCircle2, RotateCcw, AlarmClock } from 'lucide-react'
import { api } from '../../services/api'
import { useApi } from '../../lib/hooks'
import { useAuth } from '../../context/AuthContext'
import { Loading, PageHeader, Stat } from '../../components/ui'
import { MonthlyChart, HBars } from '../../components/charts'
import ComplaintTable from '../../components/ComplaintTable'
import ScoreInfo from '../../components/ScoreInfo'
import { STATUS_COLOR } from '../../lib/constants'

export const PerfPanel = ({ p }) => (
  <section className="card p-5">
    <div className="flex flex-wrap items-center gap-5">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-amber-400"><span className="font-display text-3xl font-bold">{p.score}</span></div>
      <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
        {[['Received', p.received], ['Resolved', p.resolved], ['Avg resolution', p.avgDays != null ? `${p.avgDays} d` : '—'], ['On-time', p.onTimePct != null ? `${p.onTimePct}%` : '—'], ['Reopened', p.reopenPct != null ? `${p.reopenPct}%` : '—'], ['Citizen satisfaction', p.satisfaction != null ? `${p.satisfaction}%` : '—']].map(([l, v]) => <div key={l}><p className="text-xs text-slate-500">{l}</p><p className="text-lg font-bold">{v}</p></div>)}
      </div>
    </div>
    <ScoreInfo />
  </section>
)

export default function DeptDashboard() {
  const { user } = useAuth()
  const d = useApi(() => api.deptOverview(user.departmentId), [user.departmentId])
  if (!d) return <Loading />
  const status = [['Pending', d.pending, STATUS_COLOR.Assigned], ['In progress', d.inProgress, STATUS_COLOR['In Progress']], ['Resolved', d.resolved, STATUS_COLOR.Resolved], ['Reopened', d.reopened, STATUS_COLOR.Reopened]].map(([name, value, color]) => ({ name, value, color }))
  return (
    <div>
      <PageHeader title={d.dept.name} sub={`Resolution target: ${d.dept.slaDays} days from submission.`}><Link to="/dept/complaints" className="btn btn-primary">Open complaint queue</Link></PageHeader>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Assigned" value={d.total} icon={ClipboardList} />
        <Stat label="Pending" value={d.pending} icon={Clock} tone="#0284C7" />
        <Stat label="In progress" value={d.inProgress} icon={Wrench} tone="#D97706" />
        <Stat label="Resolved" value={d.resolved} icon={CheckCircle2} tone="#16A34A" />
        <Stat label="Reopened" value={d.reopened} icon={RotateCcw} tone="#DC2626" />
        <Stat label="Near deadline" value={d.approaching.length} hint="Due within 2 days or overdue" icon={AlarmClock} tone="#B45309" />
      </div>
      <div className="mt-6"><PerfPanel p={d.perf} /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="mb-2 text-lg font-bold">Complaints by status</h2><HBars data={status} height={220} /></section>
        <section className="card p-5"><h2 className="mb-2 text-lg font-bold">Monthly trend</h2><MonthlyChart data={d.monthly} /></section>
      </div>
      <h2 className="mb-3 mt-8 text-xl font-bold">Needs attention first</h2>
      <ComplaintTable rows={d.approaching} empty="Nothing is close to its deadline." />
    </div>
  )
}
