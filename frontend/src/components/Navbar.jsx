import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const linkBase = 'text-sm font-medium text-ink-soft hover:text-ink transition'
const linkActive = 'text-ink'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const nav = useNavigate()
  const [categories, setCategories] = useState([])
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 transition ${
        scrolled
          ? 'bg-canvas/85 backdrop-blur border-b border-line'
          : 'bg-canvas border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 h-[72px] flex items-center justify-between gap-8">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-coral font-extrabold text-lg">
            S
          </span>
          <span className="font-extrabold tracking-tight text-xl text-ink">
            storefront<span className="text-coral">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
            Home
          </NavLink>
          <NavLink to="/shop" className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
            Shop
          </NavLink>
          {categories.slice(0, 3).map((c) => (
            <NavLink
              key={c.id}
              to={`/shop?category=${c.slug}`}
              className={linkBase}
            >
              {c.name}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `${linkBase} ${isActive ? 'text-coral' : 'text-coral/80 hover:text-coral'}`}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <NavLink to="/orders" className={linkBase}>
                Orders
              </NavLink>
              <span className="text-line-strong">·</span>
              <span className="text-sm text-ink-muted">
                Hi, <span className="text-ink font-medium">{user.name.split(' ')[0]}</span>
              </span>
              <button
                onClick={() => { logout(); nav('/') }}
                className="text-sm font-medium text-ink-muted hover:text-coral transition"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:inline btn-ghost px-4 py-2 text-sm">
              Sign in
            </Link>
          )}

          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center h-10 w-10 rounded-full bg-ink text-canvas hover:bg-ink-soft transition"
            aria-label={`Cart, ${count} items`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.5 12.5A2 2 0 0 0 9.5 18h8a2 2 0 0 0 2-1.6L21 8H6" />
              <circle cx="10" cy="21" r="1.2" />
              <circle cx="18" cy="21" r="1.2" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral text-white text-[11px] font-semibold px-1">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
