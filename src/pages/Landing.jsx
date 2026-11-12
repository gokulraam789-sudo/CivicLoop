import { Link } from 'react-router-dom'
import { Camera, Route as RouteIcon, ShieldCheck, ThumbsUp, ArrowRight } from 'lucide-react'
import { api } from '../services/api'
import { useApi } from '../lib/hooks'
import { catOf } from '../lib/constants'

const STEPS = [
  [Camera, 'Report with a photo and a pin', 'Pick a category, drop a pin or use GPS. Nearby duplicates are shown before you submit.'],
  [RouteIcon, 'It reaches the right department', 'The complaint is routed by category and tracked against a resolution deadline.'],
  [ShieldCheck, 'The department shows proof', 'Work is only marked complete when a photograph of the finished job is uploaded.'],
  [ThumbsUp, 'You confirm the fix', 'If the problem is still there, reopen it and it returns to the department’s queue.'],
]

export default function Landing() {
  const ov = useApi(() => api.overview())
  const resolved = useApi(() => api.listComplaints({ group: 'resolved' }))
  const sample = resolved?.find((c) => c.resolutionImages?.length)
  return (
    <div className="space-y-14">
      <section className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-brand-900 sm:text-5xl">Fix it once. See it fixed. Report, track and verify every civic issue.</h1>
          <p className="mt-4 max-w-xl text-lg text-slate-700">CivicLoop connects citizens, departments and administrators so a pothole, a leak or a dark street never disappears into a file.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/citizen/report" className="btn btn-primary">Report an issue <ArrowRight size={16} /></Link>
            <Link to="/public" className="btn btn-outline">See public accountability</Link>
          </div>
        </div>
        <div className="card p-4">
          <p className="mb-3 text-sm font-semibold">Verified fix{sample ? ` · ${sample.id} · ${catOf(sample.category).short}` : ''}</p>
          {sample ? (
            <div className="grid grid-cols-2 gap-3">
              <figure><img src={sample.images[0]} alt="Before" className="aspect-[4/3] w-full rounded-lg object-cover" /><figcaption className="mt-1 text-xs text-slate-500">Reported</figcaption></figure>
              <figure><img src={sample.resolutionImages[0]} alt="After" className="aspect-[4/3] w-full rounded-lg object-cover" /><figcaption className="mt-1 text-xs text-slate-500">Resolved and confirmed by the citizen</figcaption></figure>
            </div>
          ) : <div className="h-40 rounded-lg bg-brand-50" />}
          <p className="mt-3 text-sm text-slate-600">{sample?.address}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[['Complaints reported', ov?.total], ['Resolved', ov?.resolved], ['Average days to resolve', ov?.avgDays], ['Registered citizens', ov?.citizens]].map(([l, v]) => (
          <div key={l} className="border-l-4 border-amber-400 pl-4"><p className="font-display text-4xl font-bold text-brand-900">{v ?? '—'}</p><p className="text-sm text-slate-600">{l}</p></div>
        ))}
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-bold">How the loop closes</h2>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([Icon, t, d], i) => (
            <li key={t} className="card p-5">
              <span className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 font-display font-bold text-white">{i + 1}</span>
              <h3 className="flex items-center gap-2 text-lg font-bold"><Icon size={18} className="text-brand-600" />{t}</h3>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl bg-brand-900 p-6 text-white sm:p-8">
        <h2 className="text-2xl font-bold">One platform, three views</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[['Citizens', 'Report, support and verify.'], ['Departments', 'Work a prioritised queue with deadlines.'], ['Administrators', 'Route, reassign and watch performance.']].map(([t, d]) => (
            <div key={t}><h3 className="font-bold text-amber-400">{t}</h3><p className="text-sm text-brand-100">{d}</p></div>
          ))}
        </div>
        <Link to="/login" className="btn btn-accent mt-5">Log in with a demo account</Link>
      </section>
    </div>
  )
}
