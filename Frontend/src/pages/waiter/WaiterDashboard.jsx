import { useEffect, useMemo, useState } from 'react'
import { BellRing, Check, Clock3, RefreshCw, Utensils } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { LoadingSkeleton } from '../../components/common/Loader.jsx'
import {
  fetchOrders,
  setOrderStatus,
} from '../../features/orders/orderSlice.js'
import {
  fetchWaiterRequests,
  setWaiterRequestStatus,
  updateRequestFromSocket,
} from '../../features/waiterRequests/waiterRequestSlice.js'
import { connectSocket, disconnectSocket, joinStaffRoom } from '../../services/socket.js'
import { formatDateTime } from '../../utils/formatters.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

const requestLabels = {
  WATER: 'Water',
  EXTRA_PLATES: 'Extra plates',
  CUTLERY: 'Cutlery',
  CLEANING: 'Cleaning',
  OTHER: 'Other',
}

export default function WaiterDashboard() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector((state) => state.orders)
  const requests = useAppSelector((state) => state.waiterRequests)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    dispatch(fetchOrders())
    dispatch(fetchWaiterRequests())

    const orderRefreshId = window.setInterval(() => {
      dispatch(fetchOrders())
    }, 20000)
    const requestRefreshId = window.setInterval(() => {
      dispatch(fetchWaiterRequests())
    }, 20000)

    const socket = connectSocket()
    const handleConnect = () => joinStaffRoom()
    const handleNewRequest = (payload) => {
      dispatch(fetchWaiterRequests())
      toast(`New ${requestLabels[payload.requestType] ?? 'service'} request · Table ${payload.table}`)
    }
    const handleRequestUpdate = (payload) =>
      dispatch(updateRequestFromSocket(payload))
    const handleOrderUpdate = () => dispatch(fetchOrders())
    const handleSocketError = (payload) =>
      toast.error(payload?.message ?? 'Staff live updates are unavailable.')
    const handleConnectError = () =>
      toast.error('Live staff updates could not connect. Periodic refresh remains active.')

    socket.on('connect', handleConnect)
    socket.on('new-waiter-request', handleNewRequest)
    socket.on('waiter-request-updated', handleRequestUpdate)
    socket.on('order-updated', handleOrderUpdate)
    socket.on('socket-error', handleSocketError)
    socket.on('connect_error', handleConnectError)
    if (socket.connected) handleConnect()

    return () => {
      window.clearInterval(orderRefreshId)
      window.clearInterval(requestRefreshId)
      socket.off('connect', handleConnect)
      socket.off('new-waiter-request', handleNewRequest)
      socket.off('waiter-request-updated', handleRequestUpdate)
      socket.off('order-updated', handleOrderUpdate)
      socket.off('socket-error', handleSocketError)
      socket.off('connect_error', handleConnectError)
      disconnectSocket()
    }
  }, [dispatch])

  const activeOrders = useMemo(
    () =>
      orders.items.filter((order) =>
        ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(order.status),
      ),
    [orders.items],
  )
  const openRequests = useMemo(
    () => requests.items.filter((request) => !['COMPLETED', 'CANCELLED'].includes(request.status)),
    [requests.items],
  )

  const updateRequest = async (request, status) => {
    setUpdatingId(request._id)
    try {
      await dispatch(
        setWaiterRequestStatus({ id: request._id, status }),
      ).unwrap()
      toast.success(`Request ${status.toLowerCase()}.`)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to update request.'))
    } finally {
      setUpdatingId(null)
    }
  }

  const markServed = async (order) => {
    setUpdatingId(order._id)
    try {
      await dispatch(
        setOrderStatus({ id: order._id, status: 'SERVED' }),
      ).unwrap()
      toast.success(`${order.orderNumber} marked served.`)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to mark order served.'))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            <Utensils aria-hidden="true" className="size-4" />
            Service workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">
            Tables and guest requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Respond to service requests and close the loop on ready orders.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            dispatch(fetchOrders())
            dispatch(fetchWaiterRequests())
          }}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Refresh
        </Button>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                <BellRing aria-hidden="true" className="size-4 text-brand-600" />
                Guest requests
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {openRequests.length} active
              </p>
            </div>
          </div>
          {requests.status === 'loading' && !requests.items.length ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <LoadingSkeleton key={index} className="h-24" />
              ))}
            </div>
          ) : requests.status === 'failed' && !requests.items.length ? (
            <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              <p>{requests.error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => dispatch(fetchWaiterRequests())}
              >
                Retry
              </Button>
            </div>
          ) : openRequests.length ? (
            <div className="space-y-3">
              {openRequests.map((request) => (
                <div
                  key={request._id}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink-950">
                        {requestLabels[request.requestType] ?? request.requestType}
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          Table {request.table?.tableNumber ?? '—'}
                        </span>
                      </p>
                      {request.message && (
                        <p className="mt-1 text-sm text-slate-600">{request.message}</p>
                      )}
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                        <Clock3 aria-hidden="true" className="size-3" />
                        {formatDateTime(request.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                      {request.status.toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    {request.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        loading={updatingId === request._id}
                        onClick={() => updateRequest(request, 'ACKNOWLEDGED')}
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      size="sm"
                      loading={updatingId === request._id}
                      onClick={() => updateRequest(request, 'COMPLETED')}
                    >
                      <Check aria-hidden="true" className="size-4" />
                      Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={BellRing}
              title="No open requests"
              description="New guest requests will arrive here."
            />
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-ink-950">Active table orders</h2>
            <p className="mt-1 text-xs text-slate-500">
              Mark kitchen-ready orders as served.
            </p>
          </div>
          {orders.status === 'loading' && !orders.items.length ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <LoadingSkeleton key={index} className="h-24" />
              ))}
            </div>
          ) : orders.status === 'failed' && !orders.items.length ? (
            <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
              <p>{orders.error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => dispatch(fetchOrders())}
              >
                Retry
              </Button>
            </div>
          ) : activeOrders.length ? (
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-950">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Table {order.table?.tableNumber ?? '—'} ·{' '}
                      {order.items?.length ?? 0} items
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                      {order.status.toLowerCase()}
                    </span>
                  </div>
                  {order.status === 'READY' && (
                    <Button
                      size="sm"
                      loading={updatingId === order._id}
                      onClick={() => markServed(order)}
                    >
                      <Check aria-hidden="true" className="size-4" />
                      Served
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Utensils}
              title="No active table orders"
              description="Active orders will be listed here as they are placed."
            />
          )}
        </article>
      </section>
    </div>
  )
}
