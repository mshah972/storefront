import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('featured')

  const activeCategory = params.get('category') || ''
  const search = params.get('search') || ''

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.products({
      category: activeCategory || undefined,
      search: search || undefined,
    })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeCategory, search])

  const setParam = (k, v) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v); else next.delete(k)
    setParams(next, { replace: true })
  }

  const sorted = useMemo(() => {
    const list = [...products]
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, sort])

  const heading = useMemo(() => {
    if (search) return `Results for "${search}"`
    if (activeCategory) {
      const c = categories.find((x) => x.slug === activeCategory)
      return c ? c.name : 'Catalogue'
    }
    return 'The full catalogue'
  }, [activeCategory, search, categories])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="eyebrow">Shop</div>
          <h1 className="mt-3 text-5xl md:text-6xl font-extrabold tracking-tightest text-ink">
            {heading}
          </h1>
          <p className="mt-3 text-ink-muted">
            {loading ? 'Loading…' : `${products.length} ${products.length === 1 ? 'item' : 'items'}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="input md:w-72"
            placeholder="Search products…"
            defaultValue={search}
            onChange={(e) => setParam('search', e.target.value)}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input md:w-44"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setParam('category', '')}
          className={!activeCategory ? 'pill-ink' : 'pill hover:border-ink hover:text-ink'}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setParam('category', c.slug)}
            className={
              activeCategory === c.slug
                ? 'pill-ink'
                : 'pill hover:border-ink hover:text-ink'
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="divider mt-8" />

      {/* Grid */}
      <div className="mt-10">
        {loading ? (
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[4/5]" />
                <div className="skeleton h-3 w-1/3 mt-4" />
                <div className="skeleton h-4 w-2/3 mt-2" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="eyebrow">No matches</div>
            <h2 className="mt-3 text-3xl font-extrabold">Nothing fits that search.</h2>
            <p className="mt-2 text-ink-muted">Try different keywords or clear the filters.</p>
            <Link to="/shop" className="btn-ghost mt-6 inline-flex">View everything</Link>
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
