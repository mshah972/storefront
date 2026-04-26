import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { add } = useCart()
  const nav = useNavigate()

  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.product(slug).then(setProduct).catch((e) => setError(e.message))
  }, [slug])

  const handleAdd = async (buyNow) => {
    if (!user) { nav('/login', { state: { from: `/shop/${slug}` } }); return }
    setAdding(true); setError('')
    try {
      await add(product.id, qty)
      nav(buyNow ? '/checkout' : '/cart')
    } catch (e) {
      setError(e.message)
    } finally {
      setAdding(false)
    }
  }

  if (error && !product) return <div className="mx-auto max-w-3xl px-6 py-20 eyebrow">{error}</div>
  if (!product) return <div className="mx-auto max-w-3xl px-6 py-20 eyebrow">Loading…</div>

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <nav className="flex items-center gap-2 text-sm text-ink-muted">
        <Link to="/shop" className="btn-link">Shop</Link>
        <span className="text-line-strong">/</span>
        <Link to={`/shop?category=${product.category.slug}`} className="btn-link">
          {product.category.name}
        </Link>
        <span className="text-line-strong">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-chalk shadow-soft">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <div className="eyebrow">{product.category.name}</div>
          <h1 className="mt-3 text-5xl font-extrabold tracking-tightest text-ink leading-[1.05]">
            {product.name}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-extrabold text-ink">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.stock === 0 ? (
              <span className="pill-danger">Sold out</span>
            ) : product.stock <= 5 ? (
              <span className="pill-coral">Only {product.stock} left</span>
            ) : (
              <span className="pill-success">In stock</span>
            )}
          </div>

          <p className="mt-8 text-ink-muted leading-relaxed">{product.description}</p>

          <div className="divider my-8" />

          <div className="space-y-4">
            <div>
              <div className="field-label">Quantity</div>
              <div className="inline-flex items-center rounded-full border border-line-strong overflow-hidden bg-surface">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 text-ink-muted hover:text-coral transition disabled:opacity-30"
                  disabled={qty <= 1}
                  aria-label="Decrease"
                >−</button>
                <span className="w-12 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-2.5 text-ink-muted hover:text-coral transition disabled:opacity-30"
                  disabled={qty >= product.stock}
                  aria-label="Increase"
                >+</button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleAdd(false)}
                disabled={adding || product.stock === 0}
                className="btn-primary w-full justify-center"
              >
                {product.stock === 0 ? 'Sold out' : adding ? 'Adding…' : 'Add to cart'}
              </button>
              <button
                onClick={() => handleAdd(true)}
                disabled={adding || product.stock === 0}
                className="btn-coral w-full justify-center"
              >
                Buy now
              </button>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}
          </div>

          <div className="divider my-8" />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="eyebrow">Shipping</dt>
              <dd className="mt-1 text-ink-soft">Dispatched in 2 business days.</dd>
            </div>
            <div>
              <dt className="eyebrow">Returns</dt>
              <dd className="mt-1 text-ink-soft">30 days, free of charge.</dd>
            </div>
            <div>
              <dt className="eyebrow">Sold by</dt>
              <dd className="mt-1 text-ink-soft">Storefront.dev</dd>
            </div>
            <div>
              <dt className="eyebrow">Payment</dt>
              <dd className="mt-1 text-ink-soft">Secure transaction</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
