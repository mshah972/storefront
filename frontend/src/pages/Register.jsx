import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await register(form)
      nav('/', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="eyebrow">Account</div>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tightest text-ink">Create an account.</h1>
      <p className="mt-3 text-ink-muted">Takes about ten seconds.</p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <div>
          <label className="field-label" htmlFor="name">Full name</label>
          <input
            id="name"
            className="input"
            autoComplete="name"
            required
            value={form.name}
            onChange={set('name')}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={set('email')}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.password}
            onChange={set('password')}
          />
          <p className="mt-2 text-xs text-ink-muted">Minimum 8 characters.</p>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button disabled={loading} className="btn-coral w-full justify-center">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        Already a customer?{' '}
        <Link to="/login" className="btn-link font-semibold">Sign in →</Link>
      </p>
    </div>
  )
}
