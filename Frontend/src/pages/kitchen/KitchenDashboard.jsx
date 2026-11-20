import { useEffect, useMemo, useState } from 'react'
import { ChefHat, Clock3, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { LoadingSkeleton } from '../../components/common/Loader.jsx'
import { fetchOrders, setOrderStatus } from '../../features/orders/orderSlice.js'
import { formatDateTime } from '../../utils/formatters.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

const kitchenStatuses = ['ACCEPTED', 'PREPARING']

export default function KitchenDashboard() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.orders)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    dispatch(fetchOrders())
    const refreshId = window.setInterval(() => {
      dispatch(fetchOrders())
    }, 15000)

    return () => window.clearInterval(refreshId)
  }, [dispatch])

  const kitchenOrders = useMemo(
    () => items.filter((order) => kitchenStatuses.includes(order.status)),
    [items],
  )

  const updateStatus = async (order, nextStatus) => {
    setUpdatingId(order._id)
    try {
      await dispatch(
        setOrderStatus({ id: order._id, status: nextStatus }),
      ).unwrap()
      toast.success(`${order.orderNumber} marked ${nextStatus.toLowerCase()}.`)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to update order.'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            <ChefHat aria-hidden="true" className="size-4" />
            Kitchen queue
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">
            Orders to prepare
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Accepted orders move through preparation and ready for service.
          </p>
        </div>
        <Button variant="outline" onClick={() => dispatch(fetchOrders())}>
          <RefreshCw aria-hidden="true" className="size-4" />
          Refresh
        </Button>
      </section>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
        Kitchen orders refresh every 15 seconds. The current backend does not
        broadcast kitchen order events over Socket.IO.
      </p>

      {status === 'loading' && !items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <LoadingSkeleton key={index} className="h-64" />
          ))}
        </div>
      ) : status === 'failed' && !items.length ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => dispatch(fetchOrders())}
          >
            Retry
          </Button>
        </div>
      ) : kitchenOrders.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {kitchenOrders.map((order) => (
            <article
              key={order._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink-950">{order.orderNumber}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Table {order.table?.tableNumber ?? '—'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${order.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}
                >
                  {order.status.toLowerCase()}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                <Clock3 aria-hidden="true" className="size-3.5" />
                {formatDateTime(order.createdAt)}
                <span className="mx-1">·</span>
                Est. {order.estimatedPreparationTime ?? 0} min
              </div>
              <ul className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-100">
                {(order.items ?? []).map((item, index) => (
                  <li
                    key={`${item.product ?? item.name}-${index}`}
                    className="flex justify-between gap-3 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {item.quantity} × {item.name}
                      </p>
                      {item.specialInstructions && (
                        <p className="mt-1 text-xs leading-5 text-amber-800">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-500">
                      {item.foodType?.replace('_', ' ')}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-4 w-full"
                loading={updatingId === order._id}
                disabled={Boolean(updatingId && updatingId !== order._id)}
                onClick={() =>
                  updateStatus(
                    order,
                    order.status === 'ACCEPTED' ? 'PREPARING' : 'READY',
                  )
                }
              >
                {order.status === 'ACCEPTED'
                  ? 'Start preparing'
                  : 'Mark order ready'}
              </Button>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={ChefHat}
          title="Kitchen queue is clear"
          description="New accepted orders will appear here."
        />
      )}
    </div>
  )
}
