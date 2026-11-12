// Demo seed data (Chennai). Runs once and is stored in localStorage.
import { DAY } from '../lib/format'

const ph = (label, hue, fixed) =>
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${hue},28%,${fixed ? 52 : 34}%)'/><stop offset='1' stop-color='hsl(${hue},32%,${fixed ? 70 : 20}%)'/></linearGradient></defs><rect width='640' height='420' fill='url(#g)'/><text x='320' y='215' text-anchor='middle' font-family='sans-serif' font-size='26' fill='white'>${label}</text></svg>`
  )
export const placeholderPhoto = ph

const HUE = { road: 20, garbage: 90, drain: 190, water: 215, light: 40, other: 260 }
const CAT = { R: 'road', G: 'garbage', D: 'drain', W: 'water', L: 'light', O: 'other' }
const DESC = {
  road: 'Pothole and broken road surface that is unsafe for two-wheelers and pedestrians.',
  garbage: 'Garbage has piled up and has not been collected for several days.',
  drain: 'Drain is blocked and sewage is overflowing onto the road.',
  water: 'Pipe leakage is wasting drinking water and flooding the street.',
  light: 'Streetlight is not working, leaving this stretch dark at night.',
  other: 'Fallen tree branches are blocking the footpath.',
}
const B = ['Submitted', 'Assigned', 'In Progress', 'Resolution Submitted']
const SEQ = {
  UR: ['Submitted', 'Under Review'],
  UA: ['Submitted', 'Under Review', 'Assigned'],
  AS: B.slice(0, 2), IP: B.slice(0, 3), RS: B,
  RV: [...B, 'Resolved'], RO: [...B, 'Reopened'],
  RR: [...B, 'Reopened', 'In Progress', 'Resolution Submitted', 'Resolved'],
}
// [cat, lat, lng, address, status, daysAgo, supporters, daysToResolve, parentRow]
const ROWS = [
  ['R', 13.0418, 80.2341, 'Usman Road, T Nagar', 'IP', 9, 12, 0, null],
  ['R', 13.042, 80.2344, 'Usman Road, T Nagar', 'IP', 8, 3, 0, 0],
  ['R', 13.0012, 80.2565, 'Lattice Bridge Road, Adyar', 'RV', 58, 6, 5, null],
  ['R', 12.9815, 80.218, 'Velachery Main Road', 'RO', 14, 4, 0, null],
  ['R', 13.085, 80.2101, '2nd Avenue, Anna Nagar', 'AS', 3, 2, 0, null],
  ['R', 13.1186, 80.2398, 'Perambur High Road', 'RR', 44, 7, 9, null],
  ['R', 13.0067, 80.2206, 'Guindy Industrial Estate Road', 'IP', 13, 5, 0, null],
  ['G', 13.0368, 80.2676, 'Luz Church Road, Mylapore', 'IP', 2, 9, 0, null],
  ['G', 13.0371, 80.2679, 'Luz Church Road, Mylapore', 'IP', 2, 2, 0, 7],
  ['G', 13.0002, 80.2668, 'Elliot’s Beach Road, Besant Nagar', 'RV', 35, 8, 2, null],
  ['G', 13.0732, 80.2609, 'Egmore High Road', 'AS', 1, 3, 0, null],
  ['G', 12.983, 80.2594, 'Thiruvanmiyur Bus Depot', 'RV', 41, 5, 3, null],
  ['G', 13.0517, 80.225, 'Kodambakkam High Road', 'RS', 4, 4, 0, null],
  ['G', 13.0382, 80.1565, 'Porur Junction', 'AS', 1, 1, 0, null],
  ['D', 12.9249, 80.1, 'GST Road, Tambaram', 'IP', 6, 10, 0, null],
  ['D', 13.0569, 80.2425, 'Nungambakkam High Road', 'RV', 72, 4, 4, null],
  ['D', 13.0525, 80.2646, 'Royapettah High Road', 'RO', 8, 6, 0, null],
  ['D', 13.0432, 80.23, 'Pondy Bazaar', 'AS', 2, 3, 0, null],
  ['W', 13.0092, 80.257, 'Adyar 5th Main Road', 'IP', 4, 7, 0, null],
  ['W', 13.086, 80.212, '3rd Main Road, Anna Nagar', 'RV', 33, 3, 4, null],
  ['W', 12.981, 80.22, 'Velachery Bypass', 'RS', 3, 2, 0, null],
  ['W', 13.072, 80.259, 'Egmore Pantheon Road', 'AS', 1, 5, 0, null],
  ['L', 13.0422, 80.2335, 'South Usman Road', 'RV', 51, 5, 2, null],
  ['L', 13.036, 80.269, 'Mylapore Tank East Street', 'RV', 88, 3, 1, null],
  ['L', 13.119, 80.24, 'Perambur Barracks Road', 'IP', 2, 4, 0, null],
  ['L', 12.926, 80.101, 'Sanatorium, Tambaram', 'RR', 28, 6, 3, null],
  ['L', 13.001, 80.226, 'Guindy Station Road', 'AS', 1, 1, 0, null],
  ['O', 13.056, 80.241, 'Nungambakkam Park', 'UR', 3, 2, 0, null],
  ['O', 13.084, 80.209, 'Anna Nagar Tower Park', 'UA', 5, 1, 0, null],
]

export function seed() {
  const now = Date.now()
  const yr = new Date().getFullYear()
  const pw = 'demo1234'
  const departments = [
    { id: 'd-roads', name: 'Roads & Bridges Department', categories: ['road'], slaDays: 7 },
    { id: 'd-waste', name: 'Solid Waste Management', categories: ['garbage'], slaDays: 3 },
    { id: 'd-water', name: 'Water & Drainage Board', categories: ['drain', 'water'], slaDays: 5 },
    { id: 'd-lights', name: 'Street Lighting Division', categories: ['light'], slaDays: 4 },
  ]
  const users = [
    { id: 'u-admin', name: 'Anita Raghavan', email: 'admin@civicloop.demo', mobile: '9840000001', role: 'admin' },
    { id: 'u-roads', name: 'Suresh Babu', email: 'roads@civicloop.demo', mobile: '9840000002', role: 'department', departmentId: 'd-roads' },
    { id: 'u-waste', name: 'Lakshmi Devi', email: 'waste@civicloop.demo', mobile: '9840000003', role: 'department', departmentId: 'd-waste' },
    { id: 'u-water', name: 'Ramesh Iyer', email: 'water@civicloop.demo', mobile: '9840000004', role: 'department', departmentId: 'd-water' },
    { id: 'u-lights', name: 'Mohammed Ali', email: 'lights@civicloop.demo', mobile: '9840000005', role: 'department', departmentId: 'd-lights' },
    { id: 'u-priya', name: 'Priya Natarajan', email: 'priya@civicloop.demo', mobile: '9840100001', role: 'citizen' },
    { id: 'u-arjun', name: 'Arjun Mehta', email: 'arjun@civicloop.demo', mobile: '9840100002', role: 'citizen' },
    { id: 'u-meena', name: 'Meena Krishnan', email: 'meena@civicloop.demo', mobile: '9840100003', role: 'citizen' },
    { id: 'u-karthik', name: 'Karthik Subramanian', email: 'karthik@civicloop.demo', mobile: '9840100004', role: 'citizen' },
    { id: 'u-fatima', name: 'Fatima Sheikh', email: 'fatima@civicloop.demo', mobile: '9840100005', role: 'citizen' },
  ].map((u) => ({ ...u, password: pw }))
  const citizens = users.filter((u) => u.role === 'citizen')
  const byId = (id) => users.find((u) => u.id === id)

  const complaints = []
  ROWS.forEach(([c, lat, lng, address, code, d, sup, res, par], i) => {
    const category = CAT[c]
    const dept = departments.find((x) => x.categories.includes(category))
    const deptId = code === 'UR' ? null : code === 'UA' ? 'd-roads' : dept?.id || null
    const deptUser = users.find((u) => u.departmentId === deptId)
    const rep = citizens[i % 5]
    const parent = par == null ? null : complaints[par]
    const id = `CL-${yr}-${String(i + 1).padStart(4, '0')}`
    const createdAt = now - d * DAY
    const seq = SEQ[code]
    const done = code === 'RV' || code === 'RR'
    const span = done ? res * DAY : Math.min(d * DAY * 0.7, 3 * DAY)
    const history = seq.map((s, k) => {
      const at = Math.round(createdAt + (seq.length > 1 ? (span * k) / (seq.length - 1) : 0))
      const prevReopen = seq[k - 1] === 'Reopened'
      const actor = { Submitted: rep, 'Under Review': byId('u-admin'), Resolved: rep, Reopened: rep }[s] || (s === 'Assigned' && code !== 'UA' ? null : s === 'Assigned' ? byId('u-admin') : deptUser)
      const note = {
        Submitted: 'Complaint registered', 'Under Review': 'Admin is reviewing the complaint',
        Assigned: code === 'UA' ? `Assigned to ${dept?.name || 'Roads & Bridges Department'}` : `Auto-routed to ${dept?.name}`,
        'In Progress': prevReopen ? 'Work restarted after reopening' : 'Crew sent to site',
        'Resolution Submitted': 'Work completed. Evidence photo uploaded.',
        Resolved: 'Citizen confirmed the fix', Reopened: 'Citizen reported the issue is not resolved',
      }[s]
      return { status: s, at, by: actor?.name || 'System (auto-routing)', role: actor?.role || 'system', note: parent && s === 'Submitted' ? `Complaint registered and linked to ${parent.id}` : note }
    })
    const attempts = []
    history.forEach((h, k) => {
      if (h.status !== 'Resolution Submitted') return
      const next = history[k + 1]?.status
      attempts.push({
        id: `a${k}`, at: h.at, by: h.by, note: 'Repair completed and area cleared.',
        photos: [ph('After repair · demo photo', HUE[category], true)],
        verdict: next === 'Resolved' ? 'resolved' : next === 'Reopened' ? 'rejected' : null,
        reason: next === 'Reopened' ? 'The same spot is damaged again after a few days.' : null,
      })
    })
    const ip = history.find((h) => h.status === 'In Progress')
    complaints.push({
      id, category, description: parent ? 'Reporting the same issue. It is getting worse every day.' : DESC[category],
      address, lat, lng, citizenId: rep.id, deptId, status: seq[seq.length - 1],
      parentId: parent?.id || null, createdAt, updatedAt: history[history.length - 1].at,
      resolvedAt: done ? history[history.length - 1].at : null,
      supporters: Array.from({ length: sup }, (_, k) => `u-anon-${i}-${k}`),
      images: [ph('Reported issue · demo photo', HUE[category], false)],
      resolutionImages: attempts.length ? attempts[attempts.length - 1].photos : [],
      history, attempts,
      updates: ip ? [{ at: ip.at + 3600000, by: ip.by, note: 'Site inspected. Materials and crew scheduled.' }] : [],
    })
  })

  const notifications = complaints.slice(0, 29).map((c, i) => ({
    id: 'n' + i, userId: c.citizenId, complaintId: c.id, read: i % 3 !== 0, at: c.updatedAt,
    message: c.status === 'Resolution Submitted' ? `${c.id}: work is done. Please verify the fix.` : `${c.id} is now “${c.status}”`,
  }))
  return { users, departments, complaints, notifications, settings: { dupRadius: 100 }, lastSubmit: {}, meta: { next: ROWS.length + 1 } }
}
