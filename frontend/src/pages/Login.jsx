import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(email, password)
      nav(loc.state?.from || '/', { replace: true })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="eyebrow">Account</div>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tightest text-ink">Welcome back.</h1>
      <p className="mt-3 text-ink-muted">Sign in to continue.</p>

      <form onSubmit={submit} className="mt-10 space-y-5">
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button disabled={loading} className="btn-coral w-full justify-center">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-muted">
        New here?{' '}
        <Link to="/register" className="btn-link font-semibold">Create an account →</Link>
      </p>

      <div className="card-soft mt-10 p-5">
        <div className="eyebrow mb-3">Demo accounts</div>
        <div className="space-y-2 text-sm">
          <button
            type="button"
            onClick={() => { setEmail('admin@storefront.dev'); setPassword('admin1234') }}
            className="w-full flex justify-between items-center hover:text-coral transition"
          >
            <span className="font-mono text-ink-soft">admin@storefront.dev</span>
            <span className="pill-coral">Admin · use →</span>
          </button>
          <button
            type="button"
            onClick={() => { setEmail('demo@storefront.dev'); setPassword('demo1234') }}
            className="w-full flex justify-between items-center hover:text-coral transition"
          >
            <span className="font-mono text-ink-soft">demo@storefront.dev</span>
            <span className="pill">Customer · use →</span>
          </button>
        </div>
      </div>
    </div>
  )
}
