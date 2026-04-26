import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.products({ limit: 12 }).then(setProducts).catch(() => {})
    api.categories().then(setCategories).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-16 md:pt-24 pb-16">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="eyebrow">03 / Storefront</div>
            <h1 className="mt-6 text-[3.5rem] md:text-[5.5rem] leading-[0.95] tracking-tightest font-extrabold text-ink">
              Considered<br />objects,<br />
              <span className="text-coral">delivered well.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg text-ink-muted leading-relaxed">
              An end-to-end e-commerce platform — JWT auth, normalized MySQL,
              indexed catalogue queries that stay fast at scale.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/shop" className="btn-coral">
                Shop the catalogue
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
              <Link to="/register" className="btn-ghost">Create an account</Link>
            </div>

            <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-xs text-ink-subtle font-medium uppercase tracking-widest2">
              <span>React</span>
              <span className="text-line-strong">·</span>
              <span>FastAPI</span>
              <span className="text-line-strong">·</span>
              <span>MySQL</span>
              <span className="text-line-strong">·</span>
              <span>JWT · RBAC</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-chalk shadow-lift">
              <img
                src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=900"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block bg-surface border border-line rounded-2xl p-5 shadow-lift max-w-[15rem]">
              <div className="eyebrow">Featured</div>
              <p className="mt-2 text-lg font-semibold leading-snug">
                A small catalogue, finished thoughtfully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['~30%', 'Reduction in p50 API latency via composite indexes'],
            ['3NF', 'Normalized MySQL schema across six core relations'],
            ['JWT · RBAC', 'Customer & admin roles, server-validated'],
          ].map(([k, v]) => (
            <div key={k} className="card p-8">
              <div className="text-5xl font-extrabold text-ink tracking-tightest">{k}</div>
              <p className="mt-4 text-ink-muted leading-relaxed">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories — large editorial cards */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="eyebrow">Browse</div>
              <h2 className="mt-3 text-4xl font-extrabold tracking-tightest">Shop by category</h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => {
              const sample = products.find((p) => p.category.slug === c.slug)
              return (
                <Link
                  key={c.id}
                  to={`/shop?category=${c.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-chalk lift-on-hover"
                >
                  {sample?.image_url && (
                    <img
                      src={sample.image_url}
                      alt={c.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-xs uppercase tracking-widest2 text-canvas/80 font-medium">
                      Collection
                    </div>
                    <div className="mt-1 text-2xl font-extrabold text-canvas tracking-tight">
                      {c.name}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 text-canvas text-sm font-medium">
                      Browse <span className="transition group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="eyebrow">Selection</div>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tightest">Recently catalogued</h2>
          </div>
          <Link to="/shop" className="hidden md:inline btn-link text-sm font-medium">
            View all →
          </Link>
        </div>
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Promo strip */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl bg-ink text-canvas px-8 md:px-16 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="eyebrow text-coral">Built end-to-end</div>
            <h2 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tightest leading-[1.05]">
              From DB to UI,<br />in one weekend.
            </h2>
            <p className="mt-6 text-canvas/70 max-w-md leading-relaxed">
              Composable React on the front, FastAPI + SQLAlchemy on the back, MySQL with proper indexes — every layer wired by hand.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-canvas">
            {[
              ['Frontend', 'React · Vite · Tailwind · React Router'],
              ['Backend', 'FastAPI · Pydantic v2 · SQLAlchemy 2'],
              ['Auth', 'JWT · bcrypt · RBAC'],
              ['Data', 'MySQL 8 · 3NF · composite indexes'],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-canvas/15 pt-4">
                <div className="eyebrow text-coral">{k}</div>
                <div className="mt-1 text-sm text-canvas/85">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
