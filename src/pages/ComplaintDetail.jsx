import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Users, Building2, CalendarClock } from 'lucide-react'
import { api } from '../services/api'
import { useApi } from '../lib/hooks'
import { useAuth } from '../context/AuthContext'
import { Alert, CategoryTag, Empty, Field, Loading, PhotoPicker, StatusBadge, Timeline } from '../components/ui'
import { ComplaintMap } from '../components/maps'
import { fmtDate, fmtDateTime } from '../lib/format'

const Photos = ({ list, label }) => (
  <figure>
    <figcaption className="mb-1.5 text-sm font-semibold">{label}</figcaption>
    {list?.length ? <div className="grid gap-2">{list.map((s, i) => <img key={i} src={s} alt={`${label} ${i + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" />)}</div>
      : <div className="flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-line text-sm text-slate-500">Waiting for resolution evidence</div>}
  </figure>
)

export default function ComplaintDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const c = useApi(() => api.getComplaint(id), [id])
  const depts = useApi(() => api.listDepartments())
  const [msg, setMsg] = useState({ t: '', tone: 'error' })
  const [note, setNote] = useState('')
  const [after, setAfter] = useState([])
  const [reason, setReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [dept, setDept] = useState('')
  if (c === null) return <Loading />
  if (!c.id) return <Empty title="Complaint not found">Check the complaint ID and try again.</Empty>

  const run = async (fn, ok) => {
    setMsg({ t: '' })
    try { await fn(); setMsg({ t: ok || '', tone: 'info' }); setNote(''); setAfter([]); setReason(''); setRejecting(false) } catch (e) { setMsg({ t: e.message, tone: 'error' }) }
  }
  const role = user?.role
  const mine = role === 'citizen' && c.citizenId === user.id
  const isDept = role === 'department' && user.departmentId === c.deptId
  const supported = user && (c.supporters.includes(user.id) || mine)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500"><CategoryTag id={c.category} /></p>
          <h1 className="text-2xl font-bold sm:text-3xl">{c.id}</h1>
        </div>
        <StatusBadge status={c.status} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <p className="text-slate-800">{c.description}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-600" />{c.address}</div>
              <div className="flex gap-2"><Building2 size={16} className="mt-0.5 shrink-0 text-brand-600" />{c.deptName}</div>
              <div className="flex gap-2"><CalendarClock size={16} className="mt-0.5 shrink-0 text-brand-600" />Submitted {fmtDate(c.createdAt)}{c.deadline && c.status !== 'Resolved' ? ` · due ${fmtDate(c.deadline)}` : ''}</div>
              <div className="flex gap-2"><Users size={16} className="mt-0.5 shrink-0 text-brand-600" />{c.affected} citizens affected ({c.supportCount} supporters)</div>
            </dl>
            {c.parent && <p className="mt-3 text-sm text-slate-600">Linked to main complaint <Link className="font-semibold text-brand-700 underline" to={`/complaints/${c.parent.id}`}>{c.parent.id}</Link>.</p>}
          </section>

          <section className="card p-5">
            <h2 className="mb-3 text-lg font-bold">Before and after</h2>
            <div className="grid gap-4 sm:grid-cols-2"><Photos list={c.images} label="Reported" /><Photos list={c.resolutionImages} label="Department evidence" /></div>
          </section>

          <section className="card overflow-hidden"><ComplaintMap complaints={[{ ...c, parentId: null }]} center={[c.lat, c.lng]} zoom={16} height={260} detail={false} /></section>

          {c.children.length > 0 && (
            <section className="card p-5">
              <h2 className="mb-2 text-lg font-bold">Grouped reports ({c.children.length})</h2>
              <ul className="space-y-1 text-sm">{c.children.map((k) => <li key={k.id}><Link className="font-semibold text-brand-700 hover:underline" to={`/complaints/${k.id}`}>{k.id}</Link> · {fmtDate(k.createdAt)} · {k.supportCount + 1} citizens</li>)}</ul>
            </section>
          )}

          {c.attempts.length > 0 && (
            <section className="card p-5">
              <h2 className="mb-3 text-lg font-bold">Resolution attempts</h2>
              <ol className="space-y-3">
                {c.attempts.map((a, i) => (
                  <li key={a.id} className="rounded-lg border border-line p-3 text-sm">
                    <p className="font-semibold">Attempt {i + 1} · {fmtDateTime(a.at)} · {a.by}</p>
                    <p className="text-slate-600">{a.note}</p>
                    <p className="mt-1">{a.verdict === 'resolved' ? <span className="text-green-700">Citizen confirmed the fix.</span> : a.verdict === 'rejected' ? <span className="text-red-700">Citizen rejected: {a.reason}</span> : <span className="text-amber-500">Awaiting citizen verification.</span>}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <Alert tone={msg.tone}>{msg.t}</Alert>

          {mine && c.status === 'Resolution Submitted' && (
            <section className="card border-brand-600 p-5">
              <h2 className="text-lg font-bold">Is the issue resolved?</h2>
              <p className="mb-3 text-sm text-slate-600">Compare the photos, then confirm what you see on site.</p>
              {rejecting ? (
                <div className="space-y-3">
                  <Field label="What is still wrong?"><textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
                  <div className="flex gap-2"><button className="btn btn-danger btn-sm" onClick={() => run(() => api.verify(c.id, false, reason, user), 'Complaint reopened. It is back in the department’s queue.')}>Reopen complaint</button><button className="btn btn-outline btn-sm" onClick={() => setRejecting(false)}>Cancel</button></div>
                </div>
              ) : (
                <div className="flex gap-2"><button className="btn btn-primary flex-1" onClick={() => run(() => api.verify(c.id, true, '', user), 'Thank you. The complaint is now closed.')}>Issue resolved</button><button className="btn btn-outline flex-1" onClick={() => setRejecting(true)}>Issue not resolved</button></div>
              )}
            </section>
          )}

          {role === 'citizen' && c.status !== 'Resolved' && !mine && (
            <section className="card p-5">
              {supported ? <p className="text-sm font-semibold text-green-700">You are counted as affected by this issue.</p>
                : <><p className="mb-3 text-sm text-slate-600">Affected by this too? Add your support instead of filing a repeat complaint.</p><button className="btn btn-primary w-full" onClick={() => run(() => api.support(c.id, user), 'Thanks. Your support was added.')}>I am affected too</button></>}
            </section>
          )}
          {!user && <section className="card p-5 text-sm"><Link className="font-semibold text-brand-700 underline" to="/login" state={{ from: `/complaints/${c.id}` }}>Log in</Link> to support this complaint.</section>}

          {isDept && (
            <section className="card space-y-4 p-5">
              <h2 className="text-lg font-bold">Department actions</h2>
              {['Assigned', 'Reopened'].includes(c.status) && <button className="btn btn-primary w-full" onClick={() => run(() => api.updateStatus(c.id, 'In Progress', 'Work started', user), 'Marked as in progress.')}>Start work</button>}
              {c.status !== 'Resolved' && (
                <div className="space-y-2">
                  <Field label="Progress note"><textarea className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
                  <button className="btn btn-outline btn-sm" onClick={() => run(() => api.addUpdate(c.id, note, user), 'Update posted.')}>Post update</button>
                </div>
              )}
              {c.status === 'In Progress' && (
                <div className="space-y-2 border-t border-line pt-4">
                  <span className="label">Photos of the completed work</span>
                  <PhotoPicker value={after} onChange={setAfter} label="Add evidence" />
                  <button className="btn btn-accent w-full" onClick={() => run(() => api.submitResolution(c.id, after, note, user), 'Submitted. The citizen will now verify the fix.')}>Submit for citizen verification</button>
                </div>
              )}
            </section>
          )}

          {role === 'admin' && (
            <section className="card space-y-3 p-5">
              <h2 className="text-lg font-bold">Administrator actions</h2>
              <Field label={c.deptId ? 'Reassign department' : 'Assign department'}>
                <select className="input" value={dept} onChange={(e) => setDept(e.target.value)}><option value="">Choose a department</option>{depts?.filter((d) => d.id !== c.deptId).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
              </Field>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" disabled={!dept} onClick={() => run(() => api.assign(c.id, dept, user), 'Department updated.')}>{c.deptId ? 'Reassign' : 'Assign'}</button>
                {c.status === 'Submitted' && <button className="btn btn-outline btn-sm" onClick={() => run(() => api.updateStatus(c.id, 'Under Review', 'Admin started review', user), 'Marked under review.')}>Mark under review</button>}
              </div>
            </section>
          )}

          <section className="card p-5">
            <h2 className="mb-4 text-lg font-bold">Progress timeline</h2>
            <Timeline history={c.history} updates={c.updates} />
          </section>
        </div>
      </div>
    </div>
  )
}
