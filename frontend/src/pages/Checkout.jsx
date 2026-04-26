import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import ShippingForm, {
  blankShipping,
  formatShippingAddress,
  validateShipping,
} from '../components/ShippingForm'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const STEPS = ['Shipping', 'Payment', 'Review']

export default function Checkout() {
  const { cart, refresh } = useCart()
  const { user } = useAuth()
  const nav = useNavigate()

  const [step, setStep] = useState(0)
  const [shipping, setShipping] = useState({
    ...blankShipping,
    full_name: user?.name || '',
  })
  const [errors, setErrors] = useState({})
  const [payment, setPayment] = useState({
    method: 'card',
    card_name: user?.name || '',
    card_number: '',
    expiry: '',
    cvc: '',
  })
  const [topError, setTopError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="eyebrow">Checkout</div>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tightest">Cart is empty.</h1>
        <Link to="/shop" className="btn-coral mt-8 inline-flex">Continue shopping</Link>
      </div>
    )
  }

  const subtotal = Number(cart.subtotal)
  const tax = subtotal * 0.0875
  const total = subtotal + tax
  const itemCount = cart.items.reduce((n, i) => n + i.quantity, 0)

  const next = () => {
    setTopError('')
    if (step === 0) {
      const errs = validateShipping(shipping)
      setErrors(errs)
      if (Object.keys(errs).length > 0) return
    }
    if (step === 1 && payment.method === 'card') {
      if (!payment.card_number.trim() || !payment.expiry.trim() || !payment.cvc.trim()) {
        setTopError('Please fill in all card details.')
        return
      }
    }
    setStep((s) => s + 1)
  }

  const placeOrder = async () => {
    setSubmitting(true); setTopError('')
    try {
      const order = await api.checkout(formatShippingAddress(shipping))
      await refresh()
      nav(`/orders/${order.id}`)
    } catch (e) {
      setTopError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="eyebrow">Checkout</div>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tightest text-ink">One last thing.</h1>

      {/* Stepper */}
      <ol className="mt-10 grid grid-cols-3 gap-2 max-w-xl">
        {STEPS.map((label, i) => {
          const state = i < step ? 'done' : i === step ? 'current' : 'todo'
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition
                  ${state === 'done' ? 'bg-coral text-white' : ''}
                  ${state === 'current' ? 'bg-ink text-canvas' : ''}
                  ${state === 'todo' ? 'bg-line/60 text-ink-ghost' : ''}`}
              >
                {state === 'done' ? '✓' : i + 1}
              </span>
              <span className={`text-sm font-medium ${state === 'todo' ? 'text-ink-ghost' : 'text-ink-soft'}`}>
                {label}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {step === 0 && (
            <section className="card p-7">
              <h2 className="text-2xl font-extrabold tracking-tight mb-6">Shipping address</h2>
              <ShippingForm value={shipping} onChange={setShipping} errors={errors} />
            </section>
          )}

          {step === 1 && (
            <section className="card p-7">
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">Payment method</h2>
              <p className="text-sm text-ink-muted mb-6">
                Demo mode — no card is actually charged.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'card', label: 'Credit card', sub: 'Visa, Mastercard, Amex' },
                  { id: 'cash', label: 'Cash on delivery', sub: 'Pay when you receive' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      payment.method === opt.id
                        ? 'border-ink bg-coral-tint/40 ring-2 ring-coral/15'
                        : 'border-line hover:border-ink'
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      className="sr-only"
                      checked={payment.method === opt.id}
                      onChange={() => setPayment({ ...payment, method: opt.id })}
                    />
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-xs text-ink-muted mt-1">{opt.sub}</div>
                  </label>
                ))}
              </div>

              {payment.method === 'card' && (
                <div className="space-y-5">
                  <div>
                    <label className="field-label" htmlFor="card_name">Name on card</label>
                    <input
                      id="card_name"
                      autoComplete="cc-name"
                      className="input"
                      value={payment.card_name}
                      onChange={(e) => setPayment({ ...payment, card_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="card_number">Card number</label>
                    <input
                      id="card_number"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className="input font-mono"
                      placeholder="4242 4242 4242 4242"
                      value={payment.card_number}
                      onChange={(e) => setPayment({ ...payment, card_number: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="field-label" htmlFor="expiry">Expiry</label>
                      <input
                        id="expiry"
                        autoComplete="cc-exp"
                        className="input font-mono"
                        placeholder="MM / YY"
                        value={payment.expiry}
                        onChange={(e) => setPayment({ ...payment, expiry: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="cvc">CVC</label>
                      <input
                        id="cvc"
                        autoComplete="cc-csc"
                        className="input font-mono"
                        placeholder="123"
                        value={payment.cvc}
                        onChange={(e) => setPayment({ ...payment, cvc: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {step === 2 && (
            <section className="space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Ship to</h3>
                  <button onClick={() => setStep(0)} className="btn-link text-sm">Edit</button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-ink-soft leading-relaxed text-sm">
{formatShippingAddress(shipping)}
                </pre>
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Payment</h3>
                  <button onClick={() => setStep(1)} className="btn-link text-sm">Edit</button>
                </div>
                <p className="text-ink-soft text-sm">
                  {payment.method === 'card'
                    ? `Card ending in ${payment.card_number.replace(/\s/g, '').slice(-4) || '••••'}`
                    : 'Cash on delivery'}
                </p>
              </div>

              <div className="card p-6">
                <h3 className="font-semibold mb-3">Items ({itemCount})</h3>
                <ul className="divide-y divide-line">
                  {cart.items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3 py-3 text-sm">
                      <span className="text-ink">
                        {i.product.name}
                        <span className="text-ink-muted ml-2">× {i.quantity}</span>
                      </span>
                      <span className="font-semibold text-ink">
                        ${(Number(i.product.price) * i.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {topError && <p className="text-sm text-danger">{topError}</p>}

          <div className="flex justify-between gap-4">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-ghost"
            >
              Back
            </button>
            {step < 2 ? (
              <button onClick={next} className="btn-primary">Continue</button>
            ) : (
              <button onClick={placeOrder} disabled={submitting} className="btn-coral">
                {submitting ? 'Placing order…' : `Place order · $${total.toFixed(2)}`}
              </button>
            )}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="eyebrow">Order summary</div>
            <ul className="mt-5 divide-y divide-line">
              {cart.items.map((i) => (
                <li key={i.id} className="flex gap-3 py-3">
                  <div className="h-14 w-12 flex-none overflow-hidden bg-chalk rounded-lg">
                    {i.product.image_url && (
                      <img src={i.product.image_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink truncate">{i.product.name}</div>
                    <div className="eyebrow">Qty {i.quantity}</div>
                  </div>
                  <div className="text-sm font-semibold text-ink whitespace-nowrap">
                    ${(Number(i.product.price) * i.quantity).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="divider my-5" />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft">
                <dt>Subtotal</dt>
                <dd className="font-semibold text-ink">${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Shipping</dt>
                <dd>Free</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Tax (8.75%)</dt>
                <dd>${tax.toFixed(2)}</dd>
              </div>
            </dl>
            <div className="divider my-5" />
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Total</span>
              <span className="text-3xl font-extrabold tracking-tightest text-ink">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
