import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { Alert, Logo, Field } from '../components/ui'
import { homeFor } from '../lib/constants'

const DEMO = [
  ['Citizen', 'priya@civicloop.demo'], ['Roads dept', 'roads@civicloop.demo'], ['Waste dept', 'waste@civicloop.demo'],
  ['Water dept', 'water@civicloop.demo'], ['Lights dept', 'lights@civicloop.demo'], ['Admin', 'admin@civicloop.demo'],
]

export function Login() {
  const { login } = useAuth()
  const nav = useNavigate(), loc = useLocation()
  const { register, handleSubmit, setValue } = useForm()
  const [err, setErr] = useState('')
  const go = async (d) => {
    setErr('')
    try { const u = await login(d.email, d.password); nav(loc.state?.from || homeFor(u.role), { replace: true }) } catch (e) { setErr(e.message) }
  }
  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <form onSubmit={handleSubmit(go)} className="card space-y-4 p-6">
        <Logo /><h1 className="text-2xl font-bold">Log in</h1>
        <Alert>{err}</Alert>
        <Field label="Email"><input className="input" type="email" autoComplete="email" {...register('email', { required: true })} /></Field>
        <Field label="Password"><input className="input" type="password" autoComplete="current-password" {...register('password', { required: true })} /></Field>
        <button className="btn btn-primary w-full">Log in</button>
        <p className="text-sm text-slate-600">New here? <Link className="font-semibold text-brand-700 underline" to="/register">Create a citizen account</Link></p>
      </form>
      <div className="card bg-brand-50 p-6">
        <h2 className="text-lg font-bold">Demo accounts</h2>
        <p className="mb-3 text-sm text-slate-600">Password for all: <code className="rounded bg-white px-1.5 py-0.5">demo1234</code>. Pick one to fill the form.</p>
        <div className="grid grid-cols-2 gap-2">
          {DEMO.map(([l, e]) => (
            <button key={e} type="button" className="btn btn-outline btn-sm justify-start" onClick={() => { setValue('email', e); setValue('password', 'demo1234') }}>{l}</button>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">Priya has a fix waiting for her verification. Other citizen accounts: arjun, meena, karthik, fatima @civicloop.demo.</p>
      </div>
    </div>
  )
}

export function Register() {
  const { register: signUp } = useAuth()
  const nav = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [err, setErr] = useState('')
  const go = async (d) => {
    setErr('')
    try { await signUp(d); nav('/citizen', { replace: true }) } catch (e) { setErr(e.message) }
  }
  const e = (k) => errors[k] && <span className="mt-1 block text-xs text-red-600">{errors[k].message}</span>
  return (
    <form onSubmit={handleSubmit(go)} className="card mx-auto max-w-md space-y-4 p-6">
      <Logo /><h1 className="text-2xl font-bold">Create a citizen account</h1>
      <Alert>{err}</Alert>
      <Field label="Full name"><input className="input" {...register('name', { required: 'Enter your name.' })} />{e('name')}</Field>
      <Field label="Mobile number"><input className="input" inputMode="numeric" {...register('mobile', { required: 'Enter your mobile number.', pattern: { value: /^[6-9]\d{9}$/, message: 'Use a 10-digit Indian mobile number.' } })} />{e('mobile')}</Field>
      <Field label="Email"><input className="input" type="email" {...register('email', { required: 'Enter your email.' })} />{e('email')}</Field>
      <Field label="Password"><input className="input" type="password" autoComplete="new-password" {...register('password', { required: 'Choose a password.', minLength: { value: 8, message: 'Use at least 8 characters.' } })} />{e('password')}</Field>
      <button className="btn btn-primary w-full">Create account</button>
      <p className="text-xs text-slate-500">Email verification is switched on in Supabase Auth once the backend is connected.</p>
      <p className="text-sm text-slate-600">Already registered? <Link className="font-semibold text-brand-700 underline" to="/login">Log in</Link></p>
    </form>
  )
}
