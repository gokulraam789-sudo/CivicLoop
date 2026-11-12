/**
 * DEMO DATA LAYER – no backend is connected yet.
 * Everything below runs in the browser and persists to localStorage so that real user
 * actions (reporting, supporting, assigning, resolving, verifying) change real stored data.
 *
 * Each exported function matches one REST call planned for the Express backend
 * (see README, "Connecting the backend"). Replace the bodies with `http.get/post(...)`.
 */
import { seed } from '../data/seed'
import { DAY } from '../lib/format'
import { CATEGORIES, GROUPS, SCORE_WEIGHTS } from '../lib/constants'

const KEY = 'civicloop_demo_v1'
let db
try { db = JSON.parse(localStorage.getItem(KEY)) } catch { db = null }
if (!db || !db.complaints) db = seed()
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* storage full */ }
  window.dispatchEvent(new Event('civic:change'))
}
save()

const out = (v) => Promise.resolve(v === undefined ? null : JSON.parse(JSON.stringify(v)))
const fail = (m) => Promise.reject(new Error(m))
const get = (id) => db.complaints.find((c) => c.id === id)
const strip = ({ password, ...u }) => u
const need = (user, role) => { if (user?.role !== role) throw new Error('You do not have permission to do that.') }

// Haversine distance in metres. In production this is PostGIS: ST_DWithin(location, point, radius).
const dist = (a, b, c, d) => {
  const r = (x) => (x * Math.PI) / 180
  const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2
  return 2 * 6371000 * Math.asin(Math.sqrt(h))
}

function enrich(c) {
  const kids = db.complaints.filter((k) => k.parentId === c.id)
  const own = (x) => 1 + x.supporters.length
  const dept = db.departments.find((d) => d.id === c.deptId)
  return {
    ...c,
    deptName: dept?.name || 'Unassigned',
    supportCount: c.supporters.length,
    childCount: kids.length,
    affected: own(c) + kids.reduce((a, k) => a + own(k), 0),
    deadline: dept ? c.createdAt + dept.slaDays * DAY : null,
  }
}

function push(c, status, user, note) {
  const at = Date.now()
  c.status = status
  c.updatedAt = at
  c.history.push({ status, at, by: user?.name || 'System', role: user?.role || 'system', note: note || '' })
  if (status === 'Resolved') c.resolvedAt = at
  if (!String(c.citizenId).startsWith('u-anon'))
    db.notifications.unshift({ id: 'n' + at + Math.random(), userId: c.citizenId, complaintId: c.id, message: `${c.id} is now “${status}”`, at, read: false })
}
function setStatus(c, status, user, note) {
  push(c, status, user, note)
  db.complaints.filter((k) => k.parentId === c.id).forEach((k) => push(k, status, { name: 'System', role: 'system' }, `Synced with main complaint ${c.id}`))
}

// ---- Analytics (backend: SQL views / RPC) ----
const lastAt = (c, s) => [...c.history].reverse().find((h) => h.status === s)?.at
const pct = (a, b) => (b ? Math.round((100 * a) / b) : null)

export function deptPerformance(d) {
  const cs = db.complaints.filter((c) => c.deptId === d.id)
  const resolved = cs.filter((c) => c.status === 'Resolved')
  const onTime = resolved.filter((c) => lastAt(c, 'Resolution Submitted') <= c.createdAt + d.slaDays * DAY).length
  const reopened = cs.filter((c) => c.history.some((h) => h.status === 'Reopened')).length
  const verdicts = cs.flatMap((c) => c.attempts.map((a) => a.verdict)).filter(Boolean)
  const ok = verdicts.filter((v) => v === 'resolved').length
  const m = {
    received: cs.length, resolved: resolved.length,
    avgDays: resolved.length ? +(resolved.reduce((a, c) => a + (c.resolvedAt - c.createdAt), 0) / resolved.length / DAY).toFixed(1) : null,
    onTimePct: pct(onTime, resolved.length), resolutionPct: pct(resolved.length, cs.length),
    reopenPct: pct(reopened, cs.length), satisfaction: pct(ok, verdicts.length),
  }
  // Score out of 100. Metrics without data yet count as a neutral 75.
  const n = (v) => (v == null ? 75 : v)
  const W = SCORE_WEIGHTS
  m.score = Math.round(W.onTime * n(m.onTimePct) + W.resolution * n(m.resolutionPct) + W.lowReopen * (100 - n(m.reopenPct ?? 0)) + W.satisfaction * n(m.satisfaction))
  return m
}

function totals(list) {
  const c = (g) => list.filter((x) => GROUPS[g].includes(x.status)).length
  return { total: list.length, pending: c('pending'), inProgress: c('progress'), resolved: c('resolved'), reopened: c('reopened') }
}
function monthly(list) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const e = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const within = (t) => t >= d.getTime() && t < e.getTime()
    return { month: d.toLocaleString('en', { month: 'short' }), reported: list.filter((c) => within(c.createdAt)).length, resolved: list.filter((c) => c.resolvedAt && within(c.resolvedAt)).length }
  })
}
const byCategory = (list) => CATEGORIES.map((c) => ({ name: c.short, id: c.id, value: list.filter((x) => x.category === c.id).length, color: c.color })).filter((c) => c.value)

export const api = {
  // ---- auth ----
  login: (email, password) => {
    const u = db.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
    return u ? out(strip(u)) : fail('Email or password is incorrect.')
  },
  register: ({ name, mobile, email, password }) => {
    if (db.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) return fail('An account with this email already exists.')
    const u = { id: 'u-' + Date.now(), name: name.trim(), mobile, email: email.trim(), password, role: 'citizen' }
    db.users.push(u); save()
    return out(strip(u))
  },

  // ---- complaints ----
  listComplaints: (f = {}) => {
    let l = db.complaints.map(enrich)
    if (f.category) l = l.filter((c) => c.category === f.category)
    if (f.status) l = l.filter((c) => c.status === f.status)
    if (f.group) l = l.filter((c) => GROUPS[f.group].includes(c.status))
    if (f.deptId) l = l.filter((c) => c.deptId === f.deptId)
    if (f.citizenId) l = l.filter((c) => c.citizenId === f.citizenId)
    if (f.from) l = l.filter((c) => c.createdAt >= f.from)
    if (f.overdue) l = l.filter((c) => c.status !== 'Resolved' && c.deadline && c.deadline < Date.now())
    if (f.q) { const q = f.q.toLowerCase(); l = l.filter((c) => c.id.toLowerCase().includes(q) || c.address.toLowerCase().includes(q)) }
    return out(l.sort((a, b) => b.createdAt - a.createdAt))
  },
  getComplaint: (id) => {
    const c = get(id)
    if (!c) return out({ notFound: true })
    return out({ ...enrich(c), children: db.complaints.filter((k) => k.parentId === id).map(enrich), parent: c.parentId ? enrich(get(c.parentId)) : null })
  },
  findNearby: (lat, lng, category) => {
    const r = db.settings.dupRadius
    const l = db.complaints
      .filter((c) => c.category === category && !c.parentId && c.status !== 'Resolved')
      .map((c) => ({ ...enrich(c), distance: Math.round(dist(lat, lng, c.lat, c.lng)) }))
      .filter((c) => c.distance <= r)
      .sort((a, b) => a.distance - b.distance)
    return out(l)
  },
  createComplaint: (p, user) => {
    try {
      if (!CATEGORIES.some((c) => c.id === p.category)) throw new Error('Choose an issue category.')
      if ((p.description || '').trim().length < 10) throw new Error('Describe the issue in at least 10 characters.')
      if (!p.images?.length || p.images.length > 3) throw new Error('Add 1 to 3 photographs.')
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) throw new Error('Choose the issue location on the map.')
      if (Date.now() - (db.lastSubmit[user.id] || 0) < 60000) throw new Error('Please wait a minute before filing another complaint.')
      if (db.complaints.some((c) => c.citizenId === user.id && c.description === p.description.trim() && c.category === p.category)) throw new Error('You have already filed this exact complaint.')
    } catch (e) { return fail(e.message) }
    const dept = db.departments.find((d) => d.categories.includes(p.category))
    let parent = p.linkTo ? get(p.linkTo) : null
    if (parent?.parentId) parent = get(parent.parentId)
    const id = `CL-${new Date().getFullYear()}-${String(db.meta.next++).padStart(4, '0')}`
    const c = {
      id, category: p.category, description: p.description.trim(), address: p.address || `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`,
      lat: p.lat, lng: p.lng, citizenId: user.id, deptId: parent ? parent.deptId : dept?.id || null, status: 'Submitted',
      parentId: parent?.id || null, createdAt: Date.now(), updatedAt: Date.now(), resolvedAt: null,
      supporters: [], images: p.images, resolutionImages: [], history: [], attempts: [], updates: [],
    }
    db.complaints.push(c)
    push(c, 'Submitted', user, parent ? `Complaint registered and linked to ${parent.id}` : 'Complaint registered')
    if (parent) push(c, parent.status, { name: 'System', role: 'system' }, `Status copied from main complaint ${parent.id}`)
    else if (dept) push(c, 'Assigned', { name: 'System (auto-routing)', role: 'system' }, `Auto-routed to ${dept.name}`)
    else push(c, 'Under Review', { name: 'System', role: 'system' }, 'No department matches this category. Admin will review.')
    db.lastSubmit[user.id] = Date.now()
    save()
    return out(enrich(c))
  },
  support: (id, user) => {
    const c = get(id)
    if (!c) return fail('Complaint not found.')
    if (c.citizenId === user.id || c.supporters.includes(user.id)) return fail('You have already reported or supported this issue.')
    c.supporters.push(user.id); save()
    return out(enrich(c))
  },
  assign: (id, deptId, user) => {
    try { need(user, 'admin') } catch (e) { return fail(e.message) }
    const c = get(id), d = db.departments.find((x) => x.id === deptId)
    if (!c || !d) return fail('Complaint or department not found.')
    const prev = c.deptId && db.departments.find((x) => x.id === c.deptId)?.name
    c.deptId = deptId
    db.complaints.filter((k) => k.parentId === id).forEach((k) => (k.deptId = deptId))
    setStatus(c, 'Assigned', user, prev ? `Reassigned from ${prev} to ${d.name}` : `Assigned to ${d.name}`)
    save(); return out(true)
  },
  updateStatus: (id, status, note, user) => {
    const c = get(id)
    if (!c) return fail('Complaint not found.')
    if (user.role === 'department' && user.departmentId !== c.deptId) return fail('This complaint belongs to another department.')
    if (user.role === 'department' && status !== 'In Progress') return fail('Departments can only start work from here.')
    if (user.role === 'citizen') return fail('You do not have permission to do that.')
    setStatus(c, status, user, note); save(); return out(true)
  },
  addUpdate: (id, note, user) => {
    const c = get(id)
    if (!c || !note.trim()) return fail('Write a progress note first.')
    if (user.role === 'department' && user.departmentId !== c.deptId) return fail('This complaint belongs to another department.')
    c.updates.push({ at: Date.now(), by: user.name, note: note.trim() }); save(); return out(true)
  },
  submitResolution: (id, photos, note, user) => {
    const c = get(id)
    if (!c || user.role !== 'department' || user.departmentId !== c.deptId) return fail('This complaint belongs to another department.')
    if (c.status !== 'In Progress') return fail('Start work before submitting a resolution.')
    if (!photos?.length) return fail('Upload at least one photograph of the completed work.')
    c.attempts.push({ id: 'a' + Date.now(), at: Date.now(), by: user.name, note: note || 'Work completed.', photos, verdict: null, reason: null })
    c.resolutionImages = photos
    setStatus(c, 'Resolution Submitted', user, 'Work completed. Evidence photo uploaded.')
    save(); return out(true)
  },
  verify: (id, resolved, reason, user) => {
    const c = get(id)
    if (!c || c.citizenId !== user.id) return fail('Only the citizen who reported this can verify it.')
    const m = c.parentId ? get(c.parentId) : c
    if (m.status !== 'Resolution Submitted') return fail('There is no resolution waiting for verification.')
    if (!resolved && !reason?.trim()) return fail('Explain what is still wrong so the department can act.')
    const a = m.attempts[m.attempts.length - 1]
    a.verdict = resolved ? 'resolved' : 'rejected'; a.reason = resolved ? null : reason.trim(); a.verifiedAt = Date.now()
    setStatus(m, resolved ? 'Resolved' : 'Reopened', user, resolved ? 'Citizen confirmed the fix' : `Not resolved: ${reason.trim()}`)
    save(); return out(true)
  },

  // ---- dashboards ----
  overview: () => {
    const list = db.complaints.map(enrich)
    const resolved = list.filter((c) => c.resolvedAt)
    const feed = db.complaints.flatMap((c) => c.history.map((h) => ({ id: c.id, category: c.category, status: h.status, at: h.at }))).sort((a, b) => b.at - a.at).slice(0, 8)
    return out({
      ...totals(list),
      citizens: db.users.filter((u) => u.role === 'citizen').length,
      departments: db.departments.length,
      avgDays: resolved.length ? +(resolved.reduce((a, c) => a + (c.resolvedAt - c.createdAt), 0) / resolved.length / DAY).toFixed(1) : null,
      monthly: monthly(list), byCategory: byCategory(list),
      deptScores: db.departments.map((d) => ({ id: d.id, name: d.name, ...deptPerformance(d) })),
      delayed: list.filter((c) => c.status !== 'Resolved' && c.deadline && c.deadline < Date.now()),
      feed, geo: list.map((c) => ({ id: c.id, lat: c.lat, lng: c.lng, category: c.category, status: c.status, affected: c.affected, parentId: c.parentId })),
    })
  },
  deptOverview: (deptId) => {
    const d = db.departments.find((x) => x.id === deptId)
    const list = db.complaints.filter((c) => c.deptId === deptId).map(enrich)
    return out({
      dept: d, ...totals(list), perf: deptPerformance(d), monthly: monthly(list), byCategory: byCategory(list),
      approaching: list.filter((c) => c.status !== 'Resolved' && c.deadline && c.deadline - Date.now() < 2 * DAY).sort((a, b) => a.deadline - b.deadline),
    })
  },

  // ---- admin ----
  duplicateGroups: () => out(db.complaints.filter((c) => !c.parentId && db.complaints.some((k) => k.parentId === c.id)).map((m) => ({ main: enrich(m), children: db.complaints.filter((k) => k.parentId === m.id).map(enrich) }))),
  getSettings: () => out(db.settings),
  setRadius: (m, user) => { need(user, 'admin'); db.settings.dupRadius = Math.max(10, Math.min(1000, +m || 100)); save(); return out(db.settings) },
  listDepartments: () => out(db.departments.map((d) => ({ ...d, ...deptPerformance(d), users: db.users.filter((u) => u.departmentId === d.id).map(strip) }))),
  saveDepartment: (d, user) => {
    try { need(user, 'admin') } catch (e) { return fail(e.message) }
    if (!d.name?.trim()) return fail('Enter a department name.')
    if (d.id) Object.assign(db.departments.find((x) => x.id === d.id), { name: d.name.trim(), slaDays: +d.slaDays || 5, categories: d.categories })
    else db.departments.push({ id: 'd-' + Date.now(), name: d.name.trim(), slaDays: +d.slaDays || 5, categories: d.categories })
    save(); return out(true)
  },
  createDeptUser: (u, user) => {
    try { need(user, 'admin') } catch (e) { return fail(e.message) }
    if (!u.name || !u.email || !u.password || !u.departmentId) return fail('Fill in every field.')
    if (db.users.some((x) => x.email.toLowerCase() === u.email.toLowerCase())) return fail('An account with this email already exists.')
    db.users.push({ id: 'u-' + Date.now(), role: 'department', mobile: '', ...u }); save(); return out(true)
  },
  listUsers: () => out(db.users.filter((u) => u.role !== 'admin').map(strip)),

  // ---- notifications ----
  notifications: (userId) => out(db.notifications.filter((n) => n.userId === userId).slice(0, 8)),
  markRead: (userId) => { db.notifications.forEach((n) => n.userId === userId && (n.read = true)); save(); return out(true) },

  resetDemo: () => { db = seed(); save() },
}
