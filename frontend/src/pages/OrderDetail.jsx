import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

const statusPill = {
  pending: 'pill',
  paid: 'pill-coral',
  shipped: 'pill-success',
  cancelled: 'pill-danger',
}

export default function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Admins use the admin-scoped endpoint so they can view any customer's order.
    const fetcher = user?.role === 'admin' ? api.adminOrder : api.order
    fetcher(id).then(setOrder).catch((e) => setError(e.message))
  }, [id, user?.role])

  if (error) return <div className="mx-auto max-w-3xl px-6 py-20 eyebrow">{error}</div>
  if (!order) return <div className="mx-auto max-w-3xl px-6 py-20 eyebrow">Loading…</div>

  const subtotal = Number(order.total)
  const tax = subtotal * 0.0875
  const isAdmin = user?.role === 'admin'

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <Link to={isAdmin ? '/admin?tab=orders' : '/orders'} className="btn-link text-sm">
        ← {isAdmin ? 'Admin orders' : 'All orders'}
      </Link>

      <div className="mt-6 flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <span className={statusPill[order.status]}>{order.status}</span>
          <h1 className="mt-3 text-5xl font-extrabold tracking-tightest text-ink">
            {order.status === 'shipped' ? 'On its way.' : 'Thank you.'}
          </h1>
          <p className="mt-2 text-ink-muted">
            Order <span className="font-mono">#{String(order.id).padStart(6, '0')}</span> · placed{' '}
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div className="eyebrow">Total</div>
          <div className="text-4xl font-extrabold tracking-tightest text-ink">
            ${(subtotal + tax).toFixed(2)}
          </div>
        </div>
      </div>

      {isAdmin && order.customer && (
        <div className="card-soft mt-8 p-5 flex items-center justify-between gap-4">
          <div>
            <div className="eyebrow">Customer</div>
            <div className="mt-1 font-semibold">{order.customer.name}</div>
            <div className="text-sm text-ink-muted">{order.customer.email}</div>
          </div>
          <Link to="/admin?tab=orders" className="btn-ghost">Manage in admin</Link>
        </div>
      )}

      <div className="divider my-10" />

      <ul className="space-y-3">
        {order.items.map((it) => (
          <li key={it.id} className="card p-4 flex gap-4">
            <Link
              to={`/shop/${it.product.slug}`}
              className="h-24 w-20 flex-none overflow-hidden bg-chalk rounded-xl"
            >
              {it.product.image_url && (
                <img src={it.product.image_url} alt="" className="h-full w-full object-cover" />
              )}
            </Link>
            <div className="flex flex-1 items-baseline justify-between gap-4">
              <div>
                <div className="eyebrow">{it.product.category.name}</div>
                <Link
                  to={`/shop/${it.product.slug}`}
                  className="mt-1 block text-lg font-semibold text-ink hover:text-coral transition"
                >
                  {it.product.name}
                </Link>
                <div className="text-sm text-ink-muted mt-1">Qty {it.quantity}</div>
              </div>
              <div className="text-base font-semibold text-ink whitespace-nowrap">
                ${(Number(it.price_at_purchase) * it.quantity).toFixed(2)}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <div className="eyebrow">Ship to</div>
          <pre className="mt-3 whitespace-pre-wrap font-sans text-ink-soft leading-relaxed text-sm">
{order.shipping_address}
          </pre>
        </div>
        <div className="card p-6">
          <div className="eyebrow">Order summary</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Items</dt><dd>${subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between text-ink-muted"><dt>Shipping</dt><dd>Free</dd></div>
            <div className="flex justify-between text-ink-muted"><dt>Tax</dt><dd>${tax.toFixed(2)}</dd></div>
          </dl>
          <div className="divider my-4" />
          <div className="flex justify-between items-baseline">
            <span className="eyebrow">Total</span>
            <span className="text-2xl font-extrabold tracking-tight text-ink">
              ${(subtotal + tax).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <div className="mt-10 text-center">
          <Link to="/shop" className="btn-coral">Continue shopping</Link>
        </div>
      )}
    </div>
  )
}
