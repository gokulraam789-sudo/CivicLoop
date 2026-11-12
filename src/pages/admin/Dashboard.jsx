import { Link } from 'react-router-dom'
import { ClipboardList, Clock, Wrench, CheckCircle2, RotateCcw, Users, Building2 } from 'lucide-react'
import { api } from '../../services/api'
import { useApi } from '../../lib/hooks'
import { Loading, PageHeader, Stat } from '../../components/ui'
import { MonthlyChart, Donut, HBars } from '../../components/charts'
import ComplaintTable from '../../components/ComplaintTable'
import { STATUS_COLOR } from '../../lib/constants'

export default function AdminDashboard() {
  const ov = useApi(() => api.overview())
  if (!ov) return <Loading />
  const status = [['Pending', ov.pending, STATUS_COLOR.Assigned], ['In progress', ov.inProgress, STATUS_COLOR['In Progress']], ['Resolved', ov.resolved, STATUS_COLOR.Resolved], ['Reopened', ov.reopened, STATUS_COLOR.Reopened]].map(([name, value, color]) => ({ name, value, color }))
  const scores = ov.deptScores.map((d) => ({ name: d.name.split(' ').slice(0, 2).join(' '), value: d.score })).sort((a, b) => b.value - a.value)
  return (
    <div>
      <PageHeader title="Platform overview" sub="Every complaint, department and citizen on CivicLoop."><Link to="/admin/complaints" className="btn btn-primary">Manage complaints</Link></PageHeader>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total complaints" value={ov.total} icon={ClipboardList} />
        <Stat label="Pending" value={ov.pending} icon={Clock} tone="#0284C7" />
        <Stat label="In progress" value={ov.inProgress} icon={Wrench} tone="#D97706" />
        <Stat label="Resolved" value={ov.resolved} icon={CheckCircle2} tone="#16A34A" />
        <Stat label="Reopened" value={ov.reopened} icon={RotateCcw} tone="#DC2626" />
        <Stat label="Registered citizens" value={ov.citizens} icon={Users} />
        <Stat label="Departments" value={ov.departments} icon={Building2} />
        <Stat label="Average resolution" value={ov.avgDays != null ? `${ov.avgDays} d` : '—'} icon={Clock} tone="#7C3AED" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-5"><h2 className="mb-2 text-lg font-bold">Complaint trend</h2><MonthlyChart data={ov.monthly} /></section>
        <section className="card p-5"><h2 className="mb-2 text-lg font-bold">Resolution statistics</h2><HBars data={status} height={250} /></section>
        <section className="card p-5"><h2 className="mb-2 text-lg font-bold">By category</h2><Donut data={ov.byCategory} /></section>
        <section className="card p-5"><h2 className="mb-2 text-lg font-bold">Department scores</h2><HBars data={scores} max={100} height={250} /></section>
      </div>
      <h2 className="mb-3 mt-8 text-xl font-bold">Delayed complaints ({ov.delayed.length})</h2>
      <ComplaintTable rows={ov.delayed} showDept empty="No complaints are past their deadline." />
    </div>
  )
}
