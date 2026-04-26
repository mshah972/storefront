import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import AdminProducts from './admin/AdminProducts'
import AdminOrders from './admin/AdminOrders'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'products', label: 'Products' },
]

export default function Admin() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'overview'
  const [stats, setStats] = useState(null)

  const refreshStats = () => api.adminOrderStats().then(setStats).catch(() => {})

  useEffect(() => { refreshStats() }, [])

  const setTab = (id) => {
    const next = new URLSearchParams(params)
    next.set('tab', id)
    setParams(next, { replace: true })
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="flex items-baseline justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="mt-3 text-5xl md:text-6xl font-extrabold tracking-tightest text-ink">
            Dashboard
          </h1>
          <p className="mt-3 text-ink-muted">Manage catalogue and fulfill orders.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 border-b border-line flex gap-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? 'tab-active' : 'tab'}
          >
            {t.label}
            {t.id === 'orders' && stats?.ready_to_ship > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-coral text-white text-[11px] font-semibold px-1.5">
                {stats.ready_to_ship}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {tab === 'overview' && <Overview stats={stats} setTab={setTab} />}
        {tab === 'orders' && <AdminOrders onChange={refreshStats} />}
        {tab === 'products' && <AdminProducts />}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, tone = 'default', onClick }) {
  const accentBar = {
    default: 'bg-line-strong',
    coral: 'bg-coral',
    success: 'bg-emerald',
    danger: 'bg-danger',
  }
  return (
    <button
      onClick={onClick}
      className="card p-7 text-left lift-on-hover w-full relative overflow-hidden"
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${accentBar[tone]}`} />
      <div className="eyebrow">{label}</div>
      <div className="mt-3 text-5xl font-extrabold tracking-tightest text-ink">
        {value ?? '—'}
      </div>
      {sub && <div className="mt-2 text-sm text-ink-muted">{sub}</div>}
    </button>
  )
}

function Overview({ stats, setTab }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total orders"
          value={stats?.total}
          sub="All time"
          onClick={() => setTab('orders')}
        />
        <StatCard
          label="Ready to ship"
          value={stats?.ready_to_ship}
          sub="Paid · awaiting shipment"
          tone="coral"
          onClick={() => setTab('orders')}
        />
        <StatCard
          label="Shipped"
          value={stats?.shipped}
          sub="On the way"
          tone="success"
          onClick={() => setTab('orders')}
        />
        <StatCard
          label="Cancelled"
          value={stats?.cancelled}
          sub="Refunded or rejected"
          tone="danger"
          onClick={() => setTab('orders')}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-7">
          <h2 className="text-xl font-extrabold tracking-tight mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setTab('orders')} className="btn-coral justify-center">
              Process shipping queue
            </button>
            <button onClick={() => setTab('products')} className="btn-primary justify-center">
              Add a product
            </button>
            <button onClick={() => setTab('products')} className="btn-ghost justify-center">
              Manage catalogue
            </button>
            <button onClick={() => setTab('orders')} className="btn-ghost justify-center">
              View all orders
            </button>
          </div>
        </div>

        <div className="card p-7">
          <h2 className="text-xl font-extrabold tracking-tight mb-4">Operating notes</h2>
          <ul className="space-y-3 text-sm text-ink-soft">
            <li>
              <span className="text-coral">→</span>{' '}
              Orders move <code className="bg-chalk px-1.5 py-0.5 rounded text-xs">paid</code> →{' '}
              <code className="bg-chalk px-1.5 py-0.5 rounded text-xs">shipped</code> when you mark them.
            </li>
            <li>
              <span className="text-coral">→</span>{' '}
              Stock decrements atomically at checkout (transactional, with row locks).
            </li>
            <li>
              <span className="text-coral">→</span>{' '}
              Catalogue edits go live immediately — no cache invalidation needed.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
