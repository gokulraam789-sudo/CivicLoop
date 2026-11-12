import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Logo } from './ui'
import { api } from '../services/api'
import { homeFor } from '../lib/constants'

const LINKS = {
  guest: [['/explore', 'Explore map'], ['/public', 'Public dashboard']],
  citizen: [['/citizen', 'Dashboard'], ['/citizen/report', 'Report an issue'], ['/explore', 'Explore map'], ['/citizen/complaints', 'My complaints'], ['/public', 'Public dashboard']],
  department: [['/dept', 'Dashboard'], ['/dept/complaints', 'Complaints'], ['/explore', 'Explore map'], ['/public', 'Public dashboard']],
  admin: [['/admin', 'Dashboard'], ['/admin/complaints', 'Complaints'], ['/admin/departments', 'Departments & people'], ['/explore', 'Explore map'], ['/public', 'Public dashboard']],
}

export default function Shell() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const links = LINKS[user?.role || 'guest']
  const cls = ({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-white/15 text-white' : 'text-brand-100 hover:bg-white/10'}`
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-center gap-2 bg-amber-400 px-3 py-1.5 text-center text-xs font-medium text-ink">
        <Info size={14} className="shrink-0" />
        Demo mode: data is stored in this browser and no backend is connected.
        <button className="underline" onClick={() => { if (confirm('Reset all demo data?')) { api.resetDemo(); logout(); nav('/') } }}>Reset demo data</button>
      </div>
      <header className="sticky top-0 z-[900] bg-brand-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to={user ? homeFor(user.role) : '/'} aria-label="CivicLoop home"><Logo light /></Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {links.map(([to, l]) => <NavLink key={to} to={to} end className={cls}>{l}</NavLink>)}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                <span className="text-right text-xs leading-tight text-brand-100"><b className="block text-sm text-white">{user.name}</b>{user.role === 'department' ? 'Department' : user.role === 'admin' ? 'Administrator' : 'Citizen'}</span>
                <button onClick={() => { logout(); nav('/') }} className="rounded-md p-2 text-brand-100 hover:bg-white/10" aria-label="Log out"><LogOut size={18} /></button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm text-white hover:bg-white/10">Log in</Link>
                <Link to="/register" className="btn btn-sm btn-accent">Sign up</Link>
              </>
            )}
          </div>
          <button className="rounded-md p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-white/10 px-4 pb-4 pt-2 lg:hidden" onClick={() => setOpen(false)}>
            {links.map(([to, l]) => <NavLink key={to} to={to} end className={cls}>{l}</NavLink>)}
            {user ? <button className="rounded-md px-3 py-2 text-left text-sm text-brand-100" onClick={() => { logout(); nav('/') }}>Log out ({user.name})</button>
              : <><NavLink to="/login" className={cls}>Log in</NavLink><NavLink to="/register" className={cls}>Sign up</NavLink></>}
          </nav>
        )}
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8"><Outlet /></main>
      <footer className="border-t border-line py-5 text-center text-xs text-slate-500">CivicLoop · Report it. Track it. Verify it. · Built for transparency between citizens and government.</footer>
    </div>
  )
}
