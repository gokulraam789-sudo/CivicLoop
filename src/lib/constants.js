import { Construction, Trash2, Waves, Droplets, Lightbulb, CircleHelp } from 'lucide-react'

export const CENTER = [13.0527, 80.2437] // Chennai – change for your city

export const CATEGORIES = [
  { id: 'road', name: 'Road Damage / Potholes', short: 'Roads', icon: Construction, color: '#C2410C' },
  { id: 'garbage', name: 'Garbage Accumulation', short: 'Garbage', icon: Trash2, color: '#4D7C0F' },
  { id: 'drain', name: 'Drainage Problems', short: 'Drainage', icon: Waves, color: '#0E7490' },
  { id: 'water', name: 'Water Leakage', short: 'Water', icon: Droplets, color: '#2563EB' },
  { id: 'light', name: 'Streetlight Problems', short: 'Streetlights', icon: Lightbulb, color: '#B45309' },
  { id: 'other', name: 'Other Civic Issues', short: 'Other', icon: CircleHelp, color: '#6B7280' },
]
export const catOf = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[5]

export const STATUSES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolution Submitted', 'Resolved', 'Reopened']
export const STATUS_COLOR = {
  Submitted: '#64748B', 'Under Review': '#7C3AED', Assigned: '#0284C7', 'In Progress': '#D97706',
  'Resolution Submitted': '#0D9488', Resolved: '#16A34A', Reopened: '#DC2626',
}
export const GROUPS = {
  pending: ['Submitted', 'Under Review', 'Assigned'],
  progress: ['In Progress', 'Resolution Submitted'],
  resolved: ['Resolved'],
  reopened: ['Reopened'],
}
export const SCORE_WEIGHTS = { onTime: 0.35, resolution: 0.25, lowReopen: 0.2, satisfaction: 0.2 }

export const homeFor = (role) => ({ citizen: '/citizen', department: '/dept', admin: '/admin' }[role] || '/')
