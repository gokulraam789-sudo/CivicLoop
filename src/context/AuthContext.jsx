import { createContext, useContext, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import { homeFor } from '../lib/constants'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)
const SK = 'civicloop_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem(SK)) } catch { return null } })
  const set = (u) => { setUser(u); u ? localStorage.setItem(SK, JSON.stringify(u)) : localStorage.removeItem(SK); return u }
  const value = {
    user,
    login: async (e, p) => set(await api.login(e, p)),
    register: async (d) => set(await api.register(d)),
    logout: () => set(null),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function Protected({ roles, children }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return children
}
