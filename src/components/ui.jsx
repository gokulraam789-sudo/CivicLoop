import { useRef, useState } from 'react'
import { Camera, X, Loader2, AlertCircle, ImagePlus } from 'lucide-react'
import { STATUS_COLOR, catOf } from '../lib/constants'
import { fmtDateTime } from '../lib/format'
import { readImage } from '../lib/image'

export function Logo({ size = 30, light }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="none" stroke="#F2A93B" strokeWidth="3" strokeDasharray="68 14" strokeLinecap="round" transform="rotate(-60 16 16)" />
        <circle cx="16" cy="13" r="5" fill={light ? '#fff' : '#0B5A51'} />
        <path d="M16 25 11.6 16.5h8.8z" fill={light ? '#fff' : '#0B5A51'} />
      </svg>
      <span className={`font-display text-xl font-bold ${light ? 'text-white' : 'text-brand-900'}`}>CivicLoop</span>
    </span>
  )
}

export function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || '#64748B'
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: c + '18', color: c }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {status}
    </span>
  )
}

export function CategoryTag({ id }) {
  const c = catOf(id), Icon = c.icon
  return <span className="inline-flex items-center gap-1.5 text-sm"><Icon size={15} style={{ color: c.color }} />{c.short}</span>
}

export const Loading = () => <div className="flex justify-center py-20 text-brand-600"><Loader2 className="animate-spin" /></div>

export function PageHeader({ title, sub, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-slate-600">{sub}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

export function Stat({ label, value, hint, icon: Icon, tone = '#0F6E63' }) {
  return (
    <div className="card flex items-start justify-between p-4">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="mt-1 font-display text-3xl font-bold">{value ?? '—'}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      {Icon && <span className="rounded-lg p-2" style={{ background: tone + '15', color: tone }}><Icon size={20} /></span>}
    </div>
  )
}

export const Alert = ({ children, tone = 'error' }) =>
  children ? (
    <div role="alert" className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-brand-100 bg-brand-50 text-brand-900'}`}>
      <AlertCircle size={16} className="mt-0.5 shrink-0" />{children}
    </div>
  ) : null

export const Empty = ({ title, children }) => (
  <div className="card px-6 py-12 text-center">
    <p className="font-display text-lg font-bold">{title}</p>
    <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{children}</p>
  </div>
)

export function Filters({ children }) {
  return <div className="card mb-4 flex flex-wrap items-end gap-3 p-4">{children}</div>
}
export const Field = ({ label, children, className = '' }) => (
  <label className={`block ${className}`}><span className="label">{label}</span>{children}</label>
)

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/50 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${value === k ? 'border-brand-700 text-brand-700' : 'border-transparent text-slate-500 hover:text-ink'}`}>
          {label}
        </button>
      ))}
    </div>
  )
}

// Vertical lifecycle timeline: status changes and department updates merged by time.
export function Timeline({ history, updates = [] }) {
  const items = [
    ...history.map((h) => ({ at: h.at, title: h.status, note: h.note, by: h.by, color: STATUS_COLOR[h.status] })),
    ...updates.map((u) => ({ at: u.at, title: 'Progress update', note: u.note, by: u.by, color: '#94A3B8' })),
  ].sort((a, b) => a.at - b.at)
  return (
    <ol className="relative ml-2 border-l-2 border-line">
      {items.map((it, i) => (
        <li key={i} className="relative pb-5 pl-5 last:pb-0">
          <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full ring-4 ring-white" style={{ background: it.color }} />
          <p className="text-sm font-semibold">{it.title}</p>
          {it.note && <p className="text-sm text-slate-600">{it.note}</p>}
          <p className="mt-0.5 text-xs text-slate-500">{fmtDateTime(it.at)} · {it.by}</p>
        </li>
      ))}
    </ol>
  )
}

export function PhotoPicker({ value, onChange, max = 3, label = 'Add photo' }) {
  const ref = useRef()
  const [err, setErr] = useState('')
  const add = async (e) => {
    setErr('')
    try {
      const imgs = []
      for (const f of [...e.target.files].slice(0, max - value.length)) imgs.push(await readImage(f))
      onChange([...value, ...imgs])
    } catch (x) { setErr(x.message) }
    e.target.value = ''
  }
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div key={i} className="relative">
            <img src={src} alt={`Upload ${i + 1}`} className="h-24 w-24 rounded-lg object-cover" />
            <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="absolute -right-2 -top-2 rounded-full bg-ink p-1 text-white" aria-label="Remove photo"><X size={12} /></button>
          </div>
        ))}
        {value.length < max && (
          <button type="button" onClick={() => ref.current.click()} className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-xs text-slate-500 hover:border-brand-600 hover:text-brand-700">
            {value.length ? <ImagePlus size={20} /> : <Camera size={20} />}{label}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple className="hidden" onChange={add} />
      <p className="mt-1.5 text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB each.</p>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  )
}
