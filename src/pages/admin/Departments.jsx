import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { api } from '../../services/api'
import { useApi } from '../../lib/hooks'
import { useAuth } from '../../context/AuthContext'
import { Alert, Field, Loading, Modal, PageHeader, Tabs } from '../../components/ui'
import ScoreInfo from '../../components/ScoreInfo'
import { CATEGORIES } from '../../lib/constants'

function DeptForm({ dept, onClose }) {
  const { user } = useAuth()
  const [d, setD] = useState(dept || { name: '', slaDays: 5, categories: [] })
  const [err, setErr] = useState('')
  const toggle = (id) => setD({ ...d, categories: d.categories.includes(id) ? d.categories.filter((x) => x !== id) : [...d.categories, id] })
  const save = async () => { try { await api.saveDepartment(d, user); onClose() } catch (e) { setErr(e.message) } }
  return (
    <Modal title={dept ? 'Edit department' : 'Add department'} onClose={onClose}>
      <div className="space-y-4">
        <Alert>{err}</Alert>
        <Field label="Department name"><input className="input" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field>
        <Field label="Resolution deadline (days)"><input type="number" min="1" max="60" className="input" value={d.slaDays} onChange={(e) => setD({ ...d, slaDays: e.target.value })} /></Field>
        <fieldset><legend className="label">Issue categories it handles</legend>
          <div className="grid gap-2 sm:grid-cols-2">{CATEGORIES.map((c) => <label key={c.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.categories.includes(c.id)} onChange={() => toggle(c.id)} />{c.name}</label>)}</div>
          <p className="mt-2 text-xs text-slate-500">New complaints in a selected category are routed here automatically.</p>
        </fieldset>
        <div className="flex justify-end gap-2"><button className="btn btn-outline" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>Save department</button></div>
      </div>
    </Modal>
  )
}

export default function Departments() {
  const { user } = useAuth()
  const [tab, setTab] = useState('depts')
  const [edit, setEdit] = useState(null)
  const [u, setU] = useState({ name: '', email: '', password: '', departmentId: '' })
  const [msg, setMsg] = useState({ t: '', tone: 'error' })
  const depts = useApi(() => api.listDepartments())
  const users = useApi(() => api.listUsers())
  if (!depts || !users) return <Loading />
  const addUser = async () => {
    try { await api.createDeptUser(u, user); setU({ name: '', email: '', password: '', departmentId: '' }); setMsg({ t: 'Department user created.', tone: 'info' }) } catch (e) { setMsg({ t: e.message, tone: 'error' }) }
  }
  return (
    <div>
      <PageHeader title="Departments and people" sub="Configure who handles what, and keep an eye on performance.">
        <button className="btn btn-primary" onClick={() => setEdit({})}><Plus size={16} />Add department</button>
      </PageHeader>
      <Tabs value={tab} onChange={setTab} tabs={[['depts', 'Departments'], ['people', 'People']]} />
      {edit && <DeptForm dept={edit.id ? edit : null} onClose={() => setEdit(null)} />}
      {tab === 'depts' && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {depts.map((d) => (
              <section key={d.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><h2 className="text-lg font-bold">{d.name}</h2><p className="text-sm text-slate-600">{d.categories.map((c) => CATEGORIES.find((x) => x.id === c)?.short).join(', ') || 'No categories'} · {d.slaDays}-day target · {d.users.length} user(s)</p></div>
                  <div className="flex items-center gap-2"><span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-amber-400 font-display font-bold" title="Performance score">{d.score}</span><button className="btn btn-outline btn-sm" onClick={() => setEdit(d)} aria-label={`Edit ${d.name}`}><Pencil size={14} /></button></div>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  {[['Received', d.received], ['Resolved', d.resolved], ['Avg days', d.avgDays ?? '—'], ['On-time', d.onTimePct != null ? d.onTimePct + '%' : '—'], ['Reopened', d.reopenPct != null ? d.reopenPct + '%' : '—'], ['Satisfied', d.satisfaction != null ? d.satisfaction + '%' : '—']].map(([l, v]) => <div key={l}><dt className="text-xs text-slate-500">{l}</dt><dd className="font-bold">{v}</dd></div>)}
                </dl>
              </section>
            ))}
          </div>
          <ScoreInfo />
        </>
      )}
      {tab === 'people' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="card space-y-3 p-5">
            <h2 className="text-lg font-bold">Add a department user</h2>
            <Alert tone={msg.tone}>{msg.t}</Alert>
            <Field label="Name"><input className="input" value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} /></Field>
            <Field label="Email"><input className="input" type="email" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} /></Field>
            <Field label="Temporary password"><input className="input" type="password" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} /></Field>
            <Field label="Department"><select className="input" value={u.departmentId} onChange={(e) => setU({ ...u, departmentId: e.target.value })}><option value="">Choose</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
            <button className="btn btn-primary w-full" onClick={addUser}>Create user</button>
          </section>
          <section className="card overflow-x-auto lg:col-span-2">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-paper"><tr><th className="th">Name</th><th className="th">Email</th><th className="th">Role</th><th className="th">Department</th></tr></thead>
              <tbody className="divide-y divide-line">
                {users.map((p) => <tr key={p.id}><td className="td font-medium">{p.name}</td><td className="td">{p.email}</td><td className="td capitalize">{p.role}</td><td className="td">{depts.find((d) => d.id === p.departmentId)?.name || '—'}</td></tr>)}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  )
}
