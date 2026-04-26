import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'

const FILTERS = [
  { id: 'paid', label: 'Ready to ship' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'all', label: 'All orders' },
]

const statusPill = {
  pending: 'pill',
  paid: 'pill-coral',
  shipped: 'pill-success',
  cancelled: 'pill-danger',
}

export default function AdminOrders({ onChange }) {
  const [filter, setFilter] = useState('paid')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [search, setSearch] = useState('')

  const refresh = () => {
    setLoading(true)
    api.adminOrders(filter === 'all' ? undefined : filter)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [filter])

  const updateStatus = async (id, status) => {
    setBusyId(id)
    try {
      await api.adminUpdateOrderStatus(id, status)
      refresh()
      onChange?.()
    } catch (e) {
      alert(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const visible = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.toLowerCase()
    return orders.filter((o) =>
      String(o.id).includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q) ||
      o.shipping_address.toLowerCase().includes(q)
    )
  }, [orders, search])

  const totalRevenue = visible.reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={filter === f.id ? 'pill-ink' : 'pill hover:border-ink hover:text-ink'}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="card p-6 flex flex-wrap items-end gap-4 justify-between">
        <div>
          <div className="eyebrow">{FILTERS.find((f) => f.id === filter)?.label}</div>
          <div className="mt-2 text-4xl font-extrabold tracking-tightest text-ink">
            {loading ? '…' : visible.length}
            <span className="ml-3 text-sm text-ink-muted font-medium">
              {visible.length === 1 ? 'order' : 'orders'} · ${totalRevenue.toFixed(2)} value
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <input
            className="input w-72"
            placeholder="Search by order #, customer, address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={refresh} className="btn-ghost">Refresh</button>
        </div>
      </div>

      {/* Orders table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-chalk text-xs uppercase tracking-widest2 text-ink-muted">
            <tr>
              <th className="text-left px-5 py-4 font-medium">Order</th>
              <th className="text-left px-5 py-4 font-medium">Customer</th>
              <th className="text-left px-5 py-4 font-medium">Items</th>
              <th className="text-left px-5 py-4 font-medium">Ship to</th>
              <th className="text-left px-5 py-4 font-medium">Placed</th>
              <th className="text-right px-5 py-4 font-medium">Total</th>
              <th className="text-left px-5 py-4 font-medium">Status</th>
              <th className="text-right px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr><td colSpan={8} className="p-10 text-center text-ink-muted">Loading…</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan={8} className="p-12 text-center text-ink-muted">No orders match.</td></tr>
            ) : visible.map((o) => {
              const itemQty = o.items.reduce((n, i) => n + i.quantity, 0)
              const firstAddrLine = o.shipping_address.split('\n').slice(2, 4).join(', ').slice(0, 60)
              return (
                <tr key={o.id} className="hover:bg-chalk/60 transition">
                  <td className="px-5 py-4 align-top">
                    <Link to={`/orders/${o.id}`} className="font-mono text-ink hover:text-coral">
                      #{String(o.id).padStart(6, '0')}
                    </Link>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-ink">{o.customer.name}</div>
                    <div className="text-xs text-ink-muted">{o.customer.email}</div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex gap-1.5">
                      {o.items.slice(0, 4).map((it) => (
                        <div
                          key={it.id}
                          title={`${it.product.name} × ${it.quantity}`}
                          className="w-9 h-9 bg-chalk overflow-hidden flex-none rounded-lg border border-line"
                        >
                          {it.product.image_url && (
                            <img src={it.product.image_url} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                      ))}
                      {o.items.length > 4 && (
                        <span className="self-center text-xs text-ink-muted">+{o.items.length - 4}</span>
                      )}
                    </div>
                    <div className="text-xs text-ink-muted mt-1">
                      {itemQty} {itemQty === 1 ? 'unit' : 'units'}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-ink-soft max-w-[180px] truncate">
                    {firstAddrLine}
                  </td>
                  <td className="px-5 py-4 align-top text-ink-muted">
                    {new Date(o.created_at).toLocaleDateString()}
                    <div className="text-[11px]">
                      {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-right font-semibold text-ink">
                    ${Number(o.total).toFixed(2)}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <span className={statusPill[o.status]}>{o.status}</span>
                  </td>
                  <td className="px-5 py-4 align-top text-right">
                    <div className="flex flex-col gap-1.5 items-end">
                      {o.status === 'paid' && (
                        <button
                          onClick={() => updateStatus(o.id, 'shipped')}
                          disabled={busyId === o.id}
                          className="btn-coral text-xs px-4 py-2 w-full max-w-[150px]"
                        >
                          {busyId === o.id ? 'Working…' : 'Mark shipped'}
                        </button>
                      )}
                      {o.status === 'shipped' && (
                        <button
                          onClick={() => updateStatus(o.id, 'paid')}
                          disabled={busyId === o.id}
                          className="btn-ghost text-xs px-4 py-2 w-full max-w-[150px]"
                        >
                          Undo ship
                        </button>
                      )}
                      {(o.status === 'paid' || o.status === 'pending') && (
                        <button
                          onClick={() => updateStatus(o.id, 'cancelled')}
                          disabled={busyId === o.id}
                          className="btn-link text-xs"
                        >
                          Cancel
                        </button>
                      )}
                      <Link to={`/orders/${o.id}`} className="btn-link text-xs">
                        View details →
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
