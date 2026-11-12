import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { LocateFixed, CheckCircle2, Users } from 'lucide-react'
import { api } from '../../services/api'
import { useApi } from '../../lib/hooks'
import { useAuth } from '../../context/AuthContext'
import { LocationPicker } from '../../components/maps'
import { Alert, Field, PageHeader, PhotoPicker, StatusBadge } from '../../components/ui'
import { CATEGORIES, CENTER } from '../../lib/constants'
import { fmtDate } from '../../lib/format'

export default function Report() {
  const { user } = useAuth()
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({ defaultValues: { category: 'road', description: '', address: '' } })
  const [pos, setPos] = useState({ lat: CENTER[0], lng: CENTER[1] })
  const [moved, setMoved] = useState(false)
  const [fly, setFly] = useState(false)
  const [photos, setPhotos] = useState([])
  const [linkTo, setLinkTo] = useState('')
  const [err, setErr] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [supported, setSupported] = useState([])
  const cat = watch('category')
  const radius = useApi(() => api.getSettings())?.dupRadius
  const nearby = useApi(() => (moved ? api.findNearby(pos.lat, pos.lng, cat) : Promise.resolve([])), [pos.lat, pos.lng, cat, moved]) || []

  useEffect(() => { setLinkTo('') }, [cat, pos.lat, pos.lng])

  const pick = async (lat, lng, flyTo) => {
    setPos({ lat, lng }); setMoved(true); setFly(!!flyTo); setNote('')
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      const j = await r.json()
      setValue('address', j.display_name?.split(',').slice(0, 4).join(',') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    } catch {
      setValue('address', `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
      setNote('Address lookup is unavailable, so the coordinates were used. You can type a landmark instead.')
    }
  }
  const gps = () => {
    setErr('')
    if (!navigator.geolocation) return setErr('This browser cannot share your location. Tap the map to choose the spot.')
    navigator.geolocation.getCurrentPosition((p) => pick(p.coords.latitude, p.coords.longitude, true), () => setErr('Location permission was denied. Tap the map to choose the spot instead.'), { enableHighAccuracy: true, timeout: 10000 })
  }
  const support = async (id) => {
    try { await api.support(id, user); setSupported((s) => [...s, id]) } catch (e) { setErr(e.message) }
  }
  const submit = async (d) => {
    setErr('')
    if (!moved) return setErr('Choose the issue location: use GPS or tap the map.')
    if (!photos.length) return setErr('Add at least one photograph of the issue.')
    setBusy(true)
    try { setDone(await api.createComplaint({ ...d, ...pos, images: photos, linkTo: linkTo || null }, user)) } catch (e) { setErr(e.message) }
    setBusy(false)
  }

  if (done) {
    return (
      <div className="card mx-auto max-w-lg space-y-3 p-8 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={44} />
        <h1 className="text-2xl font-bold">Complaint submitted</h1>
        <p className="font-display text-3xl font-bold text-brand-700">{done.id}</p>
        <p className="text-sm text-slate-600">{done.deptName === 'Unassigned' ? 'An administrator will review it and choose the right department.' : <>Routed to <b>{done.deptName}</b>. Target resolution: <b>{fmtDate(done.deadline)}</b>.</>}</p>
        <div className="flex justify-center gap-2 pt-2">
          <Link to={`/complaints/${done.id}`} className="btn btn-primary">Track this complaint</Link>
          <button className="btn btn-outline" onClick={() => { setDone(null); setPhotos([]); setMoved(false); reset() }}>Report another</button>
        </div>
      </div>
    )
  }
  return (
    <div>
      <PageHeader title="Report a civic issue" sub="A photo and a pin are all we need. Existing reports nearby are shown so you can support them instead." />
      <form onSubmit={handleSubmit(submit)} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <fieldset>
            <legend className="label">Issue category</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CATEGORIES.map((c) => (
                <label key={c.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm ${cat === c.id ? 'border-brand-600 bg-brand-50 font-semibold' : 'border-line bg-white'}`}>
                  <input type="radio" value={c.id} className="sr-only" {...register('category')} /><c.icon size={16} style={{ color: c.color }} />{c.short}
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Describe the problem">
            <textarea rows={4} className="input" placeholder="What is wrong, and how does it affect people?" {...register('description', { required: 'Describe the issue.', minLength: { value: 10, message: 'Use at least 10 characters.' }, maxLength: { value: 600, message: 'Keep it under 600 characters.' } })} />
            {errors.description && <span className="mt-1 block text-xs text-red-600">{errors.description.message}</span>}
          </Field>
          <div><span className="label">Photographs</span><PhotoPicker value={photos} onChange={setPhotos} max={3} /></div>
          <Field label="Address or landmark"><input className="input" placeholder="Filled in from the map. Edit if needed." {...register('address')} /></Field>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="label !mb-0">Location</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={gps}><LocateFixed size={14} />Use my location</button>
          </div>
          <LocationPicker pos={pos} onPick={(a, b) => pick(a, b)} nearby={nearby} fly={fly} />
          <p className="text-xs text-slate-500">Tap the map or drag the pin to adjust. {note}</p>
          {moved && nearby.length > 0 && (
            <div className="rounded-xl border border-amber-400 bg-amber-400/10 p-4">
              <h2 className="font-bold">Already reported within {radius} m</h2>
              <p className="mb-3 text-sm text-slate-700">If one of these is your issue, support it instead of filing a new complaint.</p>
              <ul className="space-y-2">
                {nearby.map((c) => (
                  <li key={c.id} className="card flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                    <div><Link to={`/complaints/${c.id}`} target="_blank" className="font-bold text-brand-700 hover:underline">{c.id}</Link> <StatusBadge status={c.status} /><p className="text-xs text-slate-500">{c.distance} m away · <Users size={12} className="inline" /> {c.affected} affected · {fmtDate(c.createdAt)}</p></div>
                    {supported.includes(c.id) ? <span className="text-xs font-semibold text-green-700">You are counted</span> : <button type="button" className="btn btn-primary btn-sm" onClick={() => support(c.id)}>I am affected too</button>}
                  </li>
                ))}
              </ul>
              <Field label="If you still file a new complaint" className="mt-3">
                <select className="input" value={linkTo} onChange={(e) => setLinkTo(e.target.value)}>
                  <option value="">My issue is different. File it separately.</option>
                  {nearby.map((c) => <option key={c.id} value={c.id}>It is the same issue. Link it to {c.id}.</option>)}
                </select>
              </Field>
            </div>
          )}
          <Alert>{err}</Alert>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? 'Submitting…' : 'Submit complaint'}</button>
        </div>
      </form>
    </div>
  )
}
