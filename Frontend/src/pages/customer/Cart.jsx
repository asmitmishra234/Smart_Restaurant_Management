import { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { clearCart, setCartInstructions, setCartQuantity } from '../../features/cart/cartSlice.js'
import { placeCustomerOrder } from '../../features/orders/orderSlice.js'
import { formatCurrency } from '../../utils/formatters.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

export default function Cart() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { session } = useOutletContext()
  const { items } = useAppSelector((state) => state.cart)
  const placing = useAppSelector((state) => state.orders.placing)
  const [error, setError] = useState(null)
  const subtotal = items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  )

  const handlePlaceOrder = async () => {
    if (!session?.sessionToken) {
      setError('Scan the QR code on your table before placing an order.')
      return
    }
    if (!items.length) return

    setError(null)
    try {
      await dispatch(
        placeCustomerOrder({
          sessionToken: session.sessionToken,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions.trim(),
          })),
        }),
      ).unwrap()
      dispatch(clearCart())
      toast.success('Your order has been sent to the restaurant.')
      navigate('/order-tracking')
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to place your order.')
      setError(message)
      toast.error(message)
    }
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Choose a few items from the menu and they’ll show up here."
        action={
          <Link
            to="/menu"
            className="inline-flex min-h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Browse menu
          </Link>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
          {session?.tableNumber ? `Table ${session.tableNumber}` : 'Guest order'}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-950">Your order</h1>
      </section>

      <section className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        {items.map((item) => (
          <article
            key={item.productId}
            className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink-950">{item.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() =>
                    dispatch(setCartQuantity({ productId: item.productId, quantity: 0 }))
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </button>
              </div>
              <label className="mt-3 block space-y-1.5">
                <span className="text-xs font-medium text-slate-600">
                  Special instructions
                </span>
                <textarea
                  value={item.specialInstructions}
                  onChange={(event) =>
                    dispatch(
                      setCartInstructions({
                        productId: item.productId,
                        specialInstructions: event.target.value,
                      }),
                    )
                  }
                  maxLength={300}
                  rows={2}
                  placeholder="Optional · max 300 characters"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              </label>
            </div>
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
              <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 p-1">
                <button
                  type="button"
                  aria-label={`Decrease ${item.name} quantity`}
                  onClick={() =>
                    dispatch(
                      setCartQuantity({
                        productId: item.productId,
                        quantity: item.quantity - 1,
                      }),
                    )
                  }
                  className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <Minus aria-hidden="true" className="size-3.5" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold text-ink-950">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase ${item.name} quantity`}
                  disabled={item.quantity >= 50}
                  onClick={() =>
                    dispatch(
                      setCartQuantity({
                        productId: item.productId,
                        quantity: item.quantity + 1,
                      }),
                    )
                  }
                  className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                >
                  <Plus aria-hidden="true" className="size-3.5" />
                </button>
              </div>
              <p className="font-semibold text-ink-950">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-ink-950">{formatCurrency(subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Taxes are calculated by the restaurant when your bill is generated.
        </p>
        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        <Button
          size="lg"
          className="mt-5 w-full"
          loading={placing}
          onClick={handlePlaceOrder}
        >
          Place order · {formatCurrency(subtotal)}
        </Button>
      </section>
    </div>
  )
}
