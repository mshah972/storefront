import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { cart, update, remove } = useCart()
  const subtotal = Number(cart.subtotal)
  const itemCount = cart.items.reduce((n, i) => n + i.quantity, 0)

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="eyebrow">Cart</div>
        <h1 className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tightest">
          Nothing here yet.
        </h1>
        <p className="mt-4 text-ink-muted">Find something worth carrying home.</p>
        <Link to="/shop" className="btn-coral mt-10 inline-flex">Browse the catalogue</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="eyebrow">Cart</div>
      <h1 className="mt-3 text-5xl md:text-6xl font-extrabold tracking-tightest text-ink">
        Your selection
      </h1>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <ul className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <li key={item.id} className="card p-5 flex gap-5">
              <Link
                to={`/shop/${item.product.slug}`}
                className="h-28 w-24 flex-none overflow-hidden rounded-xl bg-chalk"
              >
                {item.product.image_url && (
                  <img src={item.product.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="eyebrow">{item.product.category.name}</div>
                    <Link
                      to={`/shop/${item.product.slug}`}
                      className="mt-1 block text-lg font-semibold text-ink hover:text-coral transition"
                    >
                      {item.product.name}
                    </Link>
                    <div className="mt-1 text-sm text-ink-muted">
                      ${Number(item.product.price).toFixed(2)} each
                    </div>
                  </div>
                  <div className="text-base font-semibold text-ink whitespace-nowrap">
                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="inline-flex items-center rounded-full border border-line-strong overflow-hidden bg-surface">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? remove(item.id)
                          : update(item.id, item.product.id, item.quantity - 1)
                      }
                      className="px-3 py-1.5 text-ink-muted hover:text-coral transition"
                      aria-label="Decrease"
                    >−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => update(item.id, item.product.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-ink-muted hover:text-coral transition"
                      aria-label="Increase"
                    >+</button>
                  </div>
                  <button onClick={() => remove(item.id)} className="btn-link text-sm">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="eyebrow">Summary</div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between text-ink-soft">
                <dt>Subtotal ({itemCount})</dt>
                <dd className="font-semibold text-ink">${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Shipping</dt>
                <dd>Free</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>Taxes</dt>
                <dd>Calculated at checkout</dd>
              </div>
            </dl>
            <div className="divider my-5" />
            <div className="flex items-baseline justify-between mb-6">
              <span className="eyebrow">Estimated total</span>
              <span className="text-3xl font-extrabold tracking-tightest text-ink">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <Link to="/checkout" className="btn-coral w-full justify-center">
              Proceed to checkout
            </Link>
            <Link to="/shop" className="btn-link mt-4 block text-center text-sm">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
