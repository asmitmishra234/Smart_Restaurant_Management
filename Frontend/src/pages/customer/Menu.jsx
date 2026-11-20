import { useEffect, useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { ImageOff, Plus, Search, UtensilsCrossed } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Input from '../../components/common/Input.jsx'
import { LoadingSkeleton } from '../../components/common/Loader.jsx'
import { addToCart, clearCart } from '../../features/cart/cartSlice.js'
import { fetchActiveCategories } from '../../features/categories/categorySlice.js'
import { fetchAvailableProducts } from '../../features/products/productSlice.js'
import { scanTableQR } from '../../features/tables/tableSlice.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import {
  getCustomerSession,
  saveCustomerSession,
} from '../../utils/customerSession.js'
import { formatCurrency } from '../../utils/formatters.js'

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false)

  if (!product.image || failed) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-brand-50 text-brand-700">
        {failed ? (
          <ImageOff aria-hidden="true" className="size-8" />
        ) : (
          <UtensilsCrossed aria-hidden="true" className="size-8" />
        )}
      </div>
    )
  }

  return (
    <img
      src={product.image}
      alt={product.name}
      onError={() => setFailed(true)}
      className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
    />
  )
}

function FoodBadge({ type }) {
  const color =
    type === 'VEG'
      ? 'border-emerald-500 text-emerald-700'
      : type === 'EGG'
        ? 'border-amber-500 text-amber-700'
        : 'border-rose-500 text-rose-700'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${color}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {type?.replace('_', ' ') ?? '—'}
    </span>
  )
}

export default function Menu() {
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const qrToken = searchParams.get('table')
  const { items: categories, status: categoriesStatus } = useAppSelector(
    (state) => state.categories,
  )
  const { items: products, status: productsStatus } = useAppSelector(
    (state) => state.products,
  )
  const { session } = useOutletContext()
  const [sessionError, setSessionError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const sessionStatus = !qrToken
    ? 'missing'
    : session?.qrToken === qrToken
      ? 'ready'
      : sessionError?.qrToken === qrToken
        ? 'failed'
        : 'loading'

  useEffect(() => {
    dispatch(fetchActiveCategories())
    dispatch(fetchAvailableProducts())
  }, [dispatch])

  useEffect(() => {
    let active = true

    if (!qrToken) return undefined

    const storedSession = getCustomerSession()
    if (storedSession?.qrToken === qrToken) return undefined

    if (storedSession?.sessionToken) dispatch(clearCart())

    const startSession = async () => {
      try {
        const tableSession = await dispatch(scanTableQR(qrToken)).unwrap()
        if (!active) return
        saveCustomerSession(tableSession, qrToken)
        window.dispatchEvent(new Event('restoflow:table-session'))
        toast.success(`Connected to table ${tableSession.tableNumber}.`)
      } catch (error) {
        if (!active) return
        setSessionError({
          qrToken,
          message: getApiErrorMessage(
            error,
            'Unable to verify this table QR code.',
          ),
        })
      }
    }

    startSession()

    return () => {
      active = false
    }
  }, [dispatch, qrToken])

  const visibleProducts = useMemo(() => {
    const search = query.trim().toLowerCase()
    return products.filter((product) => {
      const categoryId =
        typeof product.category === 'object'
          ? product.category?._id
          : product.category
      const matchesCategory =
        activeCategory === 'all' || categoryId === activeCategory
      const matchesQuery =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search)
      return matchesCategory && matchesQuery
    })
  }, [products, activeCategory, query])

  const handleAdd = (product) => {
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        foodType: product.foodType,
        preparationTime: product.preparationTime,
      }),
    )
    toast.success(`${product.name} added to cart.`)
  }

  const isConnected = sessionStatus === 'ready' && Boolean(session?.sessionToken)

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-end sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              RestoFlow menu
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-950">
              Good food, right this way.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Browse the menu, add your favourites, and we’ll take it from here.
            </p>
          </div>
          {isConnected ? (
            <div className="rounded-2xl bg-brand-50 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-brand-700">
                Dining at
              </p>
              <p className="mt-0.5 text-lg font-semibold text-ink-950">
                Table {session.tableNumber}
              </p>
            </div>
          ) : (
            <div className="max-w-sm rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
              {sessionStatus === 'loading'
                ? 'Verifying your table QR code…'
                : sessionStatus === 'failed'
                  ? sessionError?.message
                  : 'Scan the QR code on your table to start an order.'}
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Input
            aria-label="Search menu"
            placeholder="Search the menu…"
            leadingIcon={Search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </section>

      <nav aria-label="Menu categories" className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          aria-pressed={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${activeCategory === 'all' ? 'bg-ink-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
        >
          All items
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            aria-pressed={activeCategory === category._id}
            onClick={() => setActiveCategory(category._id)}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition ${activeCategory === category._id ? 'bg-ink-950 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
          >
            {category.name}
          </button>
        ))}
      </nav>

      {sessionStatus === 'loading' ||
      (productsStatus === 'loading' && products.length === 0) ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <LoadingSkeleton key={index} className="h-80" />
          ))}
        </section>
      ) : productsStatus === 'failed' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p>Menu items could not be loaded.</p>
        </div>
      ) : visibleProducts.length ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <article
              key={product._id}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="overflow-hidden">
                <ProductImage product={product} />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-ink-950">{product.name}</h2>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {product.description || 'Freshly prepared for your table.'}
                    </p>
                  </div>
                  <FoodBadge type={product.foodType} />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <p className="font-semibold text-ink-950">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {product.preparationTime} min
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={!isConnected}
                    onClick={() => handleAdd(product)}
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    Add
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={UtensilsCrossed}
          title={query ? 'No matching menu items' : 'No items in this category'}
          description="Try another category or check back with the restaurant team."
        />
      )}
      {(categoriesStatus === 'failed' || productsStatus === 'failed') && (
        <p role="status" className="text-center text-xs text-rose-600">
          Some menu data could not be loaded. Please refresh to try again.
        </p>
      )}
    </div>
  )
}
