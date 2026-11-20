import { createElement, useEffect, useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Check, Clock3, CookingPot, PackageCheck, ReceiptText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import Button from '../../components/common/Button.jsx'
import { fetchCustomerOrders, updateOrderFromSocket } from '../../features/orders/orderSlice.js'
import {
  connectSocket,
  disconnectSocket,
  joinTableSession,
} from '../../services/socket.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { formatDateTime } from '../../utils/formatters.js'

const orderSteps = [
  ['PLACED', 'Order received', Clock3],
  ['ACCEPTED', 'Accepted', Check],
  ['PREPARING', 'In the kitchen', CookingPot],
  ['READY', 'Ready to serve', PackageCheck],
  ['SERVED', 'Served', Check],
]

function OrderProgress({ order }) {
  const completedIndex = orderSteps.findIndex(([status]) => status === order.status)
  const isClosed =
    order.status === 'REJECTED' || order.status === 'CANCELLED'

  if (isClosed) {
    return (
      <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
        This order was {order.status.toLowerCase()}.
      </p>
    )
  }

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {orderSteps.map(([status, label, Icon], index) => {
        const complete = completedIndex >= index
        return (
          <li key={status} className="flex items-center gap-2 sm:flex-col sm:items-start">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full ${complete ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}
            >
              {createElement(Icon, {
                'aria-hidden': true,
                className: 'size-4',
              })}
            </span>
            <span
              className={`text-xs ${complete ? 'font-semibold text-ink-950' : 'text-slate-400'}`}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function OrderTracking() {
  const dispatch = useAppDispatch()
  const { session } = useOutletContext()
  const { items, status, error } = useAppSelector((state) => state.orders)

  useEffect(() => {
    if (!session?.sessionToken) return undefined

    dispatch(fetchCustomerOrders(session.sessionToken))
    const refreshId = window.setInterval(() => {
      dispatch(fetchCustomerOrders(session.sessionToken))
    }, 20000)

    const socket = connectSocket()
    const handleConnect = () => joinTableSession(session.sessionToken)
    const handleStatusUpdate = (payload) =>
      dispatch(updateOrderFromSocket(payload))
    const handleSocketError = (payload) =>
      toast.error(payload?.message ?? 'Live order tracking is unavailable.')

    socket.on('connect', handleConnect)
    socket.on('order-status-updated', handleStatusUpdate)
    socket.on('socket-error', handleSocketError)
    if (socket.connected) handleConnect()

    return () => {
      window.clearInterval(refreshId)
      socket.off('connect', handleConnect)
      socket.off('order-status-updated', handleStatusUpdate)
      socket.off('socket-error', handleSocketError)
      disconnectSocket()
    }
  }, [dispatch, session?.sessionToken])

  const sessionOrders = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [items],
  )

  if (!session?.sessionToken) {
    return (
      <EmptyState
        icon={Clock3}
        title="Connect to your table"
        description="Scan the table QR code to view and track its orders."
        action={
          <Link
            to="/menu"
            className="inline-flex min-h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
          >
            Open menu
          </Link>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
          Table {session.tableNumber}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-ink-950">Order tracking</h1>
        <p className="mt-1 text-sm text-slate-500">
          Updates arrive live when available; the page also refreshes periodically.
        </p>
      </section>

      {status === 'loading' && !items.length ? (
        <div className="h-56 animate-pulse rounded-2xl bg-slate-200" />
      ) : status === 'failed' && !items.length ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p>{getApiErrorMessage(error, 'Unable to load your orders.')}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => dispatch(fetchCustomerOrders(session.sessionToken))}
          >
            Try again
          </Button>
        </div>
      ) : sessionOrders.length ? (
        <section className="space-y-4">
          {sessionOrders.map((order) => (
            <article
              key={order._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    {formatDateTime(order.createdAt)}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-ink-950">
                    {order.orderNumber}
                  </h2>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                  {order.status.toLowerCase()}
                </span>
              </div>

              <div className="mt-5 border-y border-slate-100 py-4">
                <OrderProgress order={order} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                <p className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock3 aria-hidden="true" className="size-4 text-brand-600" />
                  Estimated preparation: {order.estimatedPreparationTime ?? 0} min
                </p>
                <Link
                  to="/bill"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
                >
                  <ReceiptText aria-hidden="true" className="size-4" />
                  View bill
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Clock3}
          title="No orders for this table yet"
          description="Once you place an order, its progress will appear here."
          action={
            <Link
              to="/menu"
              className="inline-flex min-h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              Browse menu
            </Link>
          }
        />
      )}
    </div>
  )
}
