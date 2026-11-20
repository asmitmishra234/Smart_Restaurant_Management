import { useEffect, useMemo, useState } from 'react'
import { Check, Clock3, RefreshCw, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { LoadingSkeleton } from '../../components/common/Loader.jsx'
import { fetchOrders, setOrderStatus } from '../../features/orders/orderSlice.js'
import { formatCurrency, formatDateTime } from '../../utils/formatters.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

const filters = [
  'ALL',
  'PLACED',
  'ACCEPTED',
  'PREPARING',
  'READY',
  'SERVED',
  'REJECTED',
  'CANCELLED',
]

const statusClass = {
  PLACED: 'bg-amber-50 text-amber-700',
  ACCEPTED: 'bg-blue-50 text-blue-700',
  PREPARING: 'bg-violet-50 text-violet-700',
  READY: 'bg-emerald-50 text-emerald-700',
  SERVED: 'bg-slate-100 text-slate-600',
  REJECTED: 'bg-rose-50 text-rose-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

function actionsFor(role, status) {
  if (role === 'ADMIN' && status === 'PLACED') {
    return [
      { status: 'ACCEPTED', label: 'Accept', variant: 'primary' },
      { status: 'REJECTED', label: 'Reject', variant: 'outline' },
    ]
  }
  if (role === 'ADMIN' && status === 'ACCEPTED') {
    return [{ status: 'CANCELLED', label: 'Cancel order', variant: 'outline' }]
  }
  if (role === 'KITCHEN' && status === 'ACCEPTED') {
    return [{ status: 'PREPARING', label: 'Start preparing', variant: 'primary' }]
  }
  if (role === 'KITCHEN' && status === 'PREPARING') {
    return [{ status: 'READY', label: 'Mark ready', variant: 'primary' }]
  }
  if (role === 'WAITER' && status === 'READY') {
    return [{ status: 'SERVED', label: 'Mark served', variant: 'primary' }]
  }
  return []
}

export default function Orders() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.orders)
  const role = useAppSelector((state) => state.auth.user?.role)
  const [filter, setFilter] = useState('ALL')
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  const filteredOrders = useMemo(
    () =>
      filter === 'ALL'
        ? items
        : items.filter((order) => order.status === filter),
    [items, filter],
  )

  const updateStatus = async (order, nextStatus) => {
    setUpdatingId(order._id)
    try {
      await dispatch(
        setOrderStatus({ id: order._id, status: nextStatus }),
      ).unwrap()
      toast.success(`Order ${order.orderNumber} updated.`)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to update order.'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">
          Review orders and advance each one through its allowed workflow.
        </p>
        <Button variant="outline" onClick={() => dispatch(fetchOrders())}>
          <RefreshCw aria-hidden="true" className="size-4" />
          Refresh
        </Button>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition ${filter === value ? 'bg-ink-950 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'}`}
          >
            {value === 'ALL' ? 'All orders' : value.toLowerCase()}
          </button>
        ))}
      </div>

      {status === 'loading' && !items.length ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <LoadingSkeleton key={index} className="h-52" />
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
      ) : filteredOrders.length ? (
        <section className="space-y-3">
          {filteredOrders.map((order) => {
            const actions = actionsFor(role, order.status)
            return (
              <article
                key={order._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-ink-950">
                        {order.orderNumber}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass[order.status] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        {order.status?.toLowerCase()}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        Table {order.table?.tableNumber ?? '—'}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 aria-hidden="true" className="size-3.5" />
                      {formatDateTime(order.createdAt)}
                      <span className="mx-1">·</span>
                      Estimated prep {order.estimatedPreparationTime ?? 0} min
                    </p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {(order.items ?? []).map((item, index) => (
                        <div
                          key={`${item.product ?? item.name}-${index}`}
                          className="rounded-xl bg-slate-50 px-3 py-2.5"
                        >
                          <div className="flex justify-between gap-2 text-sm">
                            <span className="font-medium text-slate-700">
                              {item.quantity} × {item.name}
                            </span>
                            <span className="shrink-0 text-slate-500">
                              {formatCurrency(item.itemTotal)}
                            </span>
                          </div>
                          {item.specialInstructions && (
                            <p className="mt-1.5 text-xs leading-5 text-amber-800">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
                    <p className="text-lg font-semibold text-ink-950">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    {actions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {actions.map((action) => (
                          <Button
                            key={action.status}
                            variant={action.variant}
                            size="sm"
                            loading={updatingId === order._id}
                            disabled={Boolean(updatingId && updatingId !== order._id)}
                            onClick={() => updateStatus(order, action.status)}
                          >
                            {action.status === 'REJECTED' ||
                            action.status === 'CANCELLED' ? (
                              <X aria-hidden="true" className="size-4" />
                            ) : (
                              <Check aria-hidden="true" className="size-4" />
                            )}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      ) : (
        <EmptyState
          icon={Clock3}
          title={filter === 'ALL' ? 'No orders yet' : `No ${filter.toLowerCase()} orders`}
          description="Orders will appear here as soon as the backend receives them."
        />
      )}
    </div>
  )
}
