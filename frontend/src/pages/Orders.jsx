import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

const statusPill = {
  pending: 'pill',
  paid: 'pill-coral',
  shipped: 'pill-success',
  cancelled: 'pill-danger',
}

const statusLabel = {
  pending: 'Pending',
  paid: 'Order placed',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.orders().then(setOrders).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      <div className="eyebrow">Account</div>
      <h1 className="mt-3 text-5xl md:text-6xl font-extrabold tracking-tightest text-ink">
        Order history
      </h1>

      {/* Tabs */}
      <div className="mt-10 border-b border-line flex gap-8">
        {[
          { id: 'all', label: 'All orders' },
          { id: 'paid', label: 'Processing' },
          { id: 'shipped', label: 'Shipped' },
          { id: 'cancelled', label: 'Cancelled' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={filter === t.id ? 'tab-active' : 'tab'}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="eyebrow">Empty</div>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tightest">No orders yet.</h2>
            <Link to="/shop" className="btn-coral mt-8 inline-flex">Start shopping</Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((o) => (
              <li key={o.id} className="card overflow-hidden">
                <Link
                  to={`/orders/${o.id}`}
                  className="grid grid-cols-2 md:grid-cols-6 gap-4 p-5 hover:bg-chalk transition"
                >
                  <div>
                    <div className="eyebrow">Order</div>
                    <div className="mt-1 font-mono text-ink">#{String(o.id).padStart(6, '0')}</div>
                  </div>
                  <div>
                    <div className="eyebrow">Date</div>
                    <div className="mt-1 text-ink-soft">
                      {new Date(o.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="eyebrow">Items</div>
                    <div className="mt-1 text-ink-soft">
                      {o.items.reduce((n, i) => n + i.quantity, 0)}
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <div className="eyebrow">Status</div>
                    <div className="mt-1">
                      <span className={statusPill[o.status]}>{statusLabel[o.status]}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 text-right">
                    <div className="eyebrow">Total</div>
                    <div className="mt-1 text-xl font-extrabold tracking-tight text-ink">
                      ${Number(o.total).toFixed(2)}
                    </div>
                  </div>
                </Link>
                <div className="border-t border-line px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {o.items.slice(0, 5).map((it) => (
                      <div key={it.id} className="h-10 w-10 overflow-hidden rounded-lg bg-chalk">
                        {it.product.image_url && (
                          <img src={it.product.image_url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                    ))}
                    {o.items.length > 5 && (
                      <span className="self-center text-xs text-ink-muted">+{o.items.length - 5}</span>
                    )}
                  </div>
                  <Link to={`/orders/${o.id}`} className="btn-link text-sm">
                    View details →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
