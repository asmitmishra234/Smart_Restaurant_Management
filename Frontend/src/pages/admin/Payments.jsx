import { useEffect } from 'react'
import { CreditCard, RefreshCw, ReceiptText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { LoadingSkeleton } from '../../components/common/Loader.jsx'
import {
  confirmCashPayment,
  fetchPendingCashPayments,
} from '../../features/payments/paymentSlice.js'
import {
  connectSocket,
  disconnectSocket,
  joinAdminRoom,
} from '../../services/socket.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { formatCurrency, formatDateTime } from '../../utils/formatters.js'

export default function Payments() {
  const dispatch = useAppDispatch()
  const {
    pendingCashPayments,
    pendingCashStatus,
    pendingCashError,
    confirmingPaymentId,
  } = useAppSelector((state) => state.payments)

  useEffect(() => {
    dispatch(fetchPendingCashPayments())
    const refreshId = window.setInterval(
      () => dispatch(fetchPendingCashPayments()),
      20000,
    )

    const socket = connectSocket()
    const handleConnect = () => joinAdminRoom()
    const refreshPayments = () => dispatch(fetchPendingCashPayments())
    const handleSocketError = (payload) =>
      toast.error(payload?.message ?? 'Admin payment notifications are unavailable.')
    const handleConnectError = () =>
      toast.error('Live payment updates could not connect. Periodic refresh remains active.')

    socket.on('connect', handleConnect)
    socket.on('cash-payment-requested', refreshPayments)
    socket.on('cash-payment-confirmed', refreshPayments)
    socket.on('socket-error', handleSocketError)
    socket.on('connect_error', handleConnectError)
    if (socket.connected) handleConnect()

    return () => {
      window.clearInterval(refreshId)
      socket.off('connect', handleConnect)
      socket.off('cash-payment-requested', refreshPayments)
      socket.off('cash-payment-confirmed', refreshPayments)
      socket.off('socket-error', handleSocketError)
      socket.off('connect_error', handleConnectError)
      disconnectSocket()
    }
  }, [dispatch])

  const handleConfirm = async (paymentId) => {
    try {
      await dispatch(confirmCashPayment(paymentId)).unwrap()
      toast.success('Cash payment confirmed.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to confirm cash payment.'))
    }
  }

  const loadingInitially =
    pendingCashStatus === 'loading' && pendingCashPayments.length === 0

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Payment management
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">
            Pending cash payments
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Confirm cash only after receiving it at the table.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => dispatch(fetchPendingCashPayments())}
          loading={pendingCashStatus === 'loading'}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Refresh
        </Button>
      </section>

      {pendingCashError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {pendingCashError}
        </p>
      )}

      {loadingInitially ? (
        <LoadingSkeleton className="h-72" />
      ) : pendingCashPayments.length ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <CreditCard aria-hidden="true" className="size-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-ink-950">
                Cash awaiting confirmation
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {pendingCashPayments.length} pending
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Table</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Method / status</th>
                  <th className="px-5 py-3">Requested</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingCashPayments.map((payment) => {
                  const orders = payment.invoice?.orders ?? []
                  const orderIds = orders
                    .map((order) => order.orderNumber ?? order._id)
                    .filter(Boolean)

                  return (
                    <tr key={payment._id} className="align-top hover:bg-slate-50/60">
                      <td className="px-5 py-4 font-medium text-ink-950">
                        {orderIds.length ? orderIds.join(', ') : '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {payment.invoice?.table?.tableNumber ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-500">Not provided</td>
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-ink-950">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="block font-medium text-slate-700">
                          {payment.paymentMethod}
                        </span>
                        <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          {payment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {formatDateTime(payment.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          size="sm"
                          loading={confirmingPaymentId === payment._id}
                          disabled={
                            confirmingPaymentId !== null &&
                            confirmingPaymentId !== payment._id
                          }
                          onClick={() => handleConfirm(payment._id)}
                        >
                          Confirm cash
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : pendingCashStatus === 'failed' ? (
        <EmptyState
          icon={ReceiptText}
          title="Payments could not be loaded"
          description="Retry to check for cash payments awaiting confirmation."
          action={
            <Button
              variant="outline"
              onClick={() => dispatch(fetchPendingCashPayments())}
            >
              Try again
            </Button>
          }
        />
      ) : (
        <EmptyState
          icon={ReceiptText}
          title="No pending cash payments"
          description="New customer cash requests will appear here."
        />
      )}
    </div>
  )
}
