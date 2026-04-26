import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-32 border-t border-line bg-chalk">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-coral font-extrabold">S</span>
            <span className="font-extrabold tracking-tight text-xl text-ink">storefront<span className="text-coral">.</span></span>
          </div>
          <p className="mt-5 text-ink-muted max-w-sm leading-relaxed">
            A small catalogue of considered objects. Built end-to-end with React, FastAPI, and MySQL — JWT-auth'd, indexed, and fast.
          </p>
        </div>

        <div className="md:col-span-2">
          <div className="eyebrow mb-4">Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop?category=apparel" className="text-ink-soft hover:text-coral transition">Apparel</Link></li>
            <li><Link to="/shop?category=audio" className="text-ink-soft hover:text-coral transition">Audio</Link></li>
            <li><Link to="/shop?category=home" className="text-ink-soft hover:text-coral transition">Home</Link></li>
            <li><Link to="/shop?category=workspace" className="text-ink-soft hover:text-coral transition">Workspace</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="eyebrow mb-4">Account</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="text-ink-soft hover:text-coral transition">Sign in</Link></li>
            <li><Link to="/register" className="text-ink-soft hover:text-coral transition">Create account</Link></li>
            <li><Link to="/orders" className="text-ink-soft hover:text-coral transition">Orders</Link></li>
            <li><Link to="/cart" className="text-ink-soft hover:text-coral transition">Cart</Link></li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <div className="eyebrow mb-4">Stack</div>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li>React · Vite · Tailwind</li>
            <li>FastAPI · SQLAlchemy</li>
            <li>MySQL · JWT</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-ink-muted">
          <span>© 2025 Storefront — Full-stack e-commerce platform</span>
          <span>Designed and built end-to-end.</span>
        </div>
      </div>
    </footer>
  )
}
