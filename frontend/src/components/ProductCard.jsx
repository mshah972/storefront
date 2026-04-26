import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  const isOut = product.stock === 0
  const isLow = product.stock > 0 && product.stock <= 5

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group block lift-on-hover"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-chalk">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="h-full w-full bg-line/30" />
        )}

        {isOut && (
          <span className="absolute top-3 left-3 pill bg-ink/90 text-canvas border-ink">
            Sold out
          </span>
        )}
        {isLow && !isOut && (
          <span className="absolute top-3 left-3 pill-coral">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className="pt-4 px-1">
        <div className="text-[11px] uppercase tracking-widest2 text-ink-subtle font-medium">
          {product.category.name}
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <h3 className="text-[17px] font-semibold text-ink group-hover:text-coral transition leading-tight line-clamp-1">
            {product.name}
          </h3>
          <span className="text-sm font-semibold text-ink whitespace-nowrap">
            ${Number(product.price).toFixed(0)}
          </span>
        </div>
      </div>
    </Link>
  )
}
