export const DAY = 86400000
export const fmtDate = (t) => (t ? new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
export const fmtDateTime = (t) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
export const daysLeft = (t) => (t ? Math.ceil((t - Date.now()) / DAY) : null)
export const timeAgo = (t) => {
  const m = Math.round((Date.now() - t) / 60000)
  if (m < 60) return `${Math.max(m, 1)} min ago`
  const h = Math.round(m / 60)
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`
}
