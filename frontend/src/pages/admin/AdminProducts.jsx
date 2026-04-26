import { useEffect, useState } from 'react'
import { api } from '../../api/client'

const blank = {
  name: '', slug: '', description: '', price: '', stock: 0, image_url: '', category_id: '',
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(blank)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const refresh = () => api.products({ limit: 100 }).then(setProducts)

  useEffect(() => {
    api.categories().then(setCategories)
    refresh()
  }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: Number(form.category_id),
      }
      if (editingId) {
        const { slug, ...patch } = payload
        await api.updateProduct(editingId, patch)
      } else {
        await api.createProduct(payload)
      }
      setForm(blank)
      setEditingId(null)
      setShowForm(false)
      refresh()
    } catch (e) {
      setError(e.message)
    }
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: String(p.price),
      stock: p.stock,
      image_url: p.image_url || '',
      category_id: p.category.id,
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const remove = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await api.deleteProduct(id)
    refresh()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(blank)
    setError('')
    setShowForm(false)
  }

  const visible = products.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.category.name.toLowerCase().includes(q)
  })

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length
  const outOfStock = products.filter((p) => p.stock === 0).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 grid-cols-3">
        <div className="card p-6 relative overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-line-strong" />
          <div className="eyebrow">Total products</div>
          <div className="mt-2 text-4xl font-extrabold tracking-tightest">{products.length}</div>
        </div>
        <div className="card p-6 relative overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-coral" />
          <div className="eyebrow">Low stock</div>
          <div className="mt-2 text-4xl font-extrabold tracking-tightest text-coral">{lowStock}</div>
        </div>
        <div className="card p-6 relative overflow-hidden">
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-danger" />
          <div className="eyebrow">Out of stock</div>
          <div className="mt-2 text-4xl font-extrabold tracking-tightest text-danger">{outOfStock}</div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-7">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-extrabold tracking-tight">
              {editingId ? `Edit product #${editingId}` : 'Add a product'}
            </h2>
            <button onClick={cancelEdit} className="btn-link text-sm">Close</button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="field-label">Name</label>
              <input className="input" required value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="field-label">Slug (URL)</label>
              <input className="input" required value={form.slug} onChange={set('slug')} disabled={!!editingId} />
            </div>
            <div className="md:col-span-2">
              <label className="field-label">Description</label>
              <textarea className="input" rows={3} required value={form.description} onChange={set('description')} />
            </div>
            <div>
              <label className="field-label">Price ($)</label>
              <input className="input" type="number" step="0.01" required value={form.price} onChange={set('price')} />
            </div>
            <div>
              <label className="field-label">Stock</label>
              <input className="input" type="number" required value={form.stock} onChange={set('stock')} />
            </div>
            <div>
              <label className="field-label">Image URL</label>
              <input className="input" value={form.image_url} onChange={set('image_url')} />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select className="input" required value={form.category_id} onChange={set('category_id')}>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {error && <p className="md:col-span-2 text-sm text-danger">{error}</p>}
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-coral">
                {editingId ? 'Save changes' : 'Create product'}
              </button>
              <button type="button" onClick={cancelEdit} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar */}
      <div className="card p-5 flex items-center justify-between gap-4">
        <input
          className="input w-72"
          placeholder="Search by name, slug, or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-coral">
            + Add a product
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-chalk text-xs uppercase tracking-widest2 text-ink-muted">
            <tr>
              <th className="text-left px-5 py-4 font-medium">Product</th>
              <th className="text-left px-5 py-4 font-medium">Category</th>
              <th className="text-right px-5 py-4 font-medium">Price</th>
              <th className="text-right px-5 py-4 font-medium">Stock</th>
              <th className="text-right px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-ink-muted">No products match.</td></tr>
            ) : visible.map((p) => (
              <tr key={p.id} className="hover:bg-chalk/60 transition">
                <td className="px-5 py-4 flex items-center gap-3">
                  <div className="w-12 h-12 flex-none bg-chalk overflow-hidden rounded-lg border border-line">
                    {p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <div className="font-medium text-ink">{p.name}</div>
                    <div className="font-mono text-[11px] text-ink-muted">{p.slug}</div>
                  </div>
                </td>
                <td className="px-5 py-4 text-ink-soft">{p.category.name}</td>
                <td className="px-5 py-4 text-right font-semibold text-ink">${Number(p.price).toFixed(2)}</td>
                <td className="px-5 py-4 text-right">
                  {p.stock === 0 ? (
                    <span className="text-danger font-semibold">Out</span>
                  ) : p.stock <= 5 ? (
                    <span className="text-coral font-semibold">{p.stock}</span>
                  ) : (
                    <span className="text-ink">{p.stock}</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => startEdit(p)} className="btn-link text-sm mr-4">Edit</button>
                  <button onClick={() => remove(p.id)} className="btn-link text-sm hover:!text-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
