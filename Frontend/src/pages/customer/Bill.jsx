import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { CheckCircle2, CreditCard, ReceiptText, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { LoadingSkeleton } from '../../components/common/Loader.jsx'
import {
  clearCurrentInvoice,
  fetchCustomerInvoice,
  generateInvoice,
} from '../../features/invoices/invoiceSlice.js'
import {
  createOnlinePaymentOrder,
  requestCashPayment,
  verifyOnlinePayment,
} from '../../features/payments/paymentSlice.js'
import { submitFeedback } from '../../features/feedback/feedbackSlice.js'
import { loadRazorpayScript } from '../../services/razorpay.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { formatCurrency, formatDateTime } from '../../utils/formatters.js'

function feedbackKey(sessionToken) {
  return `restoflow.feedback.${sessionToken}`
}

export default function Bill() {
  const dispatch = useAppDispatch()
  const { session } = useOutletContext()
  const { current: invoice } = useAppSelector((state) => state.invoices)
  const payment = useAppSelector((state) => state.payments)
  const [loadingInvoice, setLoadingInvoice] = useState(false)
  const [invoiceResult, setInvoiceResult] = useState({
    sessionToken: null,
    notFound: false,
    error: null,
  })
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackReview, setFeedbackReview] = useState('')
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [submittedForSession, setSubmittedForSession] = useState(null)
  const invoiceNotFound =
    invoiceResult.sessionToken === session?.sessionToken && invoiceResult.notFound
  const invoiceError =
    invoiceResult.sessionToken === session?.sessionToken
      ? invoiceResult.error
      : null
  const feedbackSubmitted = Boolean(
    session?.sessionToken &&
      (submittedForSession === session.sessionToken ||
        sessionStorage.getItem(feedbackKey(session.sessionToken)) === 'true'),
  )
  const pendingCashPayment =
    payment.current?.status === 'PENDING' &&
    payment.current?.paymentMethod === 'CASH'
  const pendingOnlinePayment = Boolean(
    payment.current?.paymentId && payment.current?.razorpayOrderId,
  )

  const loadInvoice = useCallback(async (sessionToken, showError = false) => {
    try {
      await dispatch(fetchCustomerInvoice(sessionToken)).unwrap()
      setInvoiceResult({ sessionToken, notFound: false, error: null })
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to load invoice.')
      if (message.toLowerCase().includes('invoice not found')) {
        setInvoiceResult({ sessionToken, notFound: true, error: null })
      } else if (showError) {
        setInvoiceResult({ sessionToken, notFound: false, error: message })
      }
    }
  }, [dispatch])

  useEffect(() => {
    dispatch(clearCurrentInvoice())
    if (!session?.sessionToken) return undefined

    let active = true
    const loadInitialInvoice = async () => {
      setLoadingInvoice(true)
      await loadInvoice(session.sessionToken, true)
      if (active) setLoadingInvoice(false)
    }
    loadInitialInvoice()
    const refreshId = window.setInterval(() => {
      loadInvoice(session.sessionToken)
    }, 15000)
    return () => {
      active = false
      window.clearInterval(refreshId)
    }
  }, [dispatch, loadInvoice, session?.sessionToken])

  const handleGenerateInvoice = async () => {
    setLoadingInvoice(true)
    setInvoiceResult({ sessionToken: session.sessionToken, notFound: false, error: null })
    try {
      await dispatch(generateInvoice(session.sessionToken)).unwrap()
      toast.success('Your invoice is ready.')
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, 'Unable to generate invoice.')
      setInvoiceResult({
        sessionToken: session.sessionToken,
        notFound: false,
        error: message,
      })
      toast.error(message)
    } finally {
      setLoadingInvoice(false)
    }
  }

  const handleCashPayment = async () => {
    try {
      await dispatch(requestCashPayment(session.sessionToken)).unwrap()
      toast.success('Cash payment requested. Please ask a team member to confirm it.')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to request cash payment.'))
    }
  }

  const completeOnlinePayment = async (paymentDetails) => {
    try {
      await dispatch(
        verifyOnlinePayment({
          sessionToken: session.sessionToken,
          paymentDetails,
        }),
      ).unwrap()
      await dispatch(fetchCustomerInvoice(session.sessionToken)).unwrap()
      toast.success('Payment confirmed. Thank you!')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to verify payment.'))
    }
  }

  const handleOnlinePayment = async () => {
    try {
      await loadRazorpayScript()
      const order = await dispatch(
        createOnlinePaymentOrder(session.sessionToken),
      ).unwrap()
      if (!order.key) {
        throw new Error('Online payment is not configured. Please use cash or ask staff.')
      }
      const RazorpayCheckout = window.Razorpay
      if (!RazorpayCheckout) {
        throw new Error('Razorpay checkout could not be initialized.')
      }

      const checkout = new RazorpayCheckout({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'RestoFlow',
        description: `Table ${session.tableNumber} invoice`,
        order_id: order.razorpayOrderId,
        handler: completeOnlinePayment,
        modal: {
          ondismiss: () =>
            toast('Checkout closed. If a payment was made, wait for confirmation.'),
        },
        theme: { color: '#c96b50' },
      })
      checkout.on('payment.failed', () => {
        toast.error(
          'Payment did not complete. A pending attempt may prevent retry; ask a team member for help.',
        )
      })
      checkout.open()
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to start online payment.'))
    }
  }

  const handleFeedback = async (event) => {
    event.preventDefault()
    setFeedbackLoading(true)
    try {
      await dispatch(
        submitFeedback({
          sessionToken: session.sessionToken,
          rating: feedbackRating,
          review: feedbackReview.trim(),
        }),
      ).unwrap()
      sessionStorage.setItem(feedbackKey(session.sessionToken), 'true')
      setSubmittedForSession(session.sessionToken)
      toast.success('Thanks for sharing your feedback.')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to submit feedback.'))
    } finally {
      setFeedbackLoading(false)
    }
  }

  if (!session?.sessionToken) {
    return (
      <EmptyState
        icon={ReceiptText}
        title="Connect to your table"
        description="Scan the table QR code to view and pay your bill."
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

  if (loadingInvoice && !invoice) {
    return <LoadingSkeleton className="mx-auto h-[28rem] max-w-2xl" />
  }

  if (!invoice) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <EmptyState
          icon={ReceiptText}
          title={invoiceNotFound ? 'Your bill is not ready yet' : 'Bill unavailable'}
          description={
            invoiceNotFound
              ? 'The bill can be generated after all active orders have been served.'
              : 'Your session bill could not be loaded.'
          }
          action={
            <Button onClick={handleGenerateInvoice} loading={loadingInvoice}>
              Generate bill
            </Button>
          }
        />
        {invoiceError && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {invoiceError}
          </p>
        )}
      </div>
    )
  }

  const isPaid = invoice.paymentStatus === 'PAID'

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            Table {session.tableNumber}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-ink-950">Your bill</h1>
          <p className="mt-1 text-sm text-slate-500">
            {invoice.invoiceNumber} · {formatDateTime(invoice.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
        >
          {invoice.paymentStatus}
        </span>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-950">Items</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {invoice.items.map((item, index) => (
            <div
              key={`${item.product ?? item.name}-${index}`}
              className="flex items-center justify-between gap-3 px-5 py-3.5"
            >
              <div>
                <p className="text-sm font-medium text-ink-950">{item.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {item.quantity} × {formatCurrency(item.price)}
                </p>
              </div>
              <p className="text-sm font-medium text-ink-950">
                {formatCurrency(item.itemTotal)}
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>GST ({invoice.gstRate}%)</span>
            <span>{formatCurrency(invoice.gstAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-ink-950">
            <span>Total</span>
            <span>{formatCurrency(invoice.totalAmount)}</span>
          </div>
        </div>
      </section>

      {isPaid ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="flex items-center gap-2 font-semibold text-emerald-800">
            <CheckCircle2 aria-hidden="true" className="size-5" />
            Payment complete
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-700">
            Your table session can now be closed by a team member.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-ink-950">Choose payment method</h2>
          <p className="mt-1 text-sm text-slate-500">
            The restaurant confirms cash payments. Online payments are verified by the backend.
          </p>
          {(pendingCashPayment || pendingOnlinePayment) && (
            <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              {pendingCashPayment
                ? 'Cash payment requested. Please ask a team member to confirm it.'
                : 'An online payment attempt is pending. If you closed checkout, ask a team member for assistance before retrying.'}
            </p>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={handleCashPayment}
              disabled={
                payment.status === 'loading' ||
                pendingCashPayment ||
                pendingOnlinePayment
              }
            >
              <ReceiptText aria-hidden="true" className="size-4" />
              Pay by cash
            </Button>
            <Button
              onClick={handleOnlinePayment}
              disabled={
                payment.status === 'loading' ||
                pendingCashPayment ||
                pendingOnlinePayment
              }
            >
              <CreditCard aria-hidden="true" className="size-4" />
              Pay online
            </Button>
          </div>
          {payment.error && (
            <p role="alert" className="mt-3 text-sm text-rose-600">
              {payment.error}
            </p>
          )}
        </section>
      )}

      {isPaid && !feedbackSubmitted && (
        <form
          onSubmit={handleFeedback}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <h2 className="text-sm font-semibold text-ink-950">How was your visit?</h2>
          <p className="mt-1 text-sm text-slate-500">Share a rating with the restaurant.</p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 5 }, (_, index) => {
              const rating = index + 1
              return (
                <button
                  key={rating}
                  type="button"
                  aria-label={`${rating} star${rating > 1 ? 's' : ''}`}
                  aria-pressed={feedbackRating === rating}
                  onClick={() => setFeedbackRating(rating)}
                  className="rounded-md p-1 text-amber-500 hover:bg-amber-50"
                >
                  <Star
                    aria-hidden="true"
                    className={`size-6 ${rating <= feedbackRating ? 'fill-current' : 'text-slate-200'}`}
                  />
                </button>
              )
            })}
          </div>
          <label className="mt-3 block space-y-1.5">
            <span className="text-xs font-medium text-slate-600">Review (optional)</span>
            <textarea
              value={feedbackReview}
              onChange={(event) => setFeedbackReview(event.target.value.slice(0, 1000))}
              rows={3}
              maxLength={1000}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <Button type="submit" className="mt-4" loading={feedbackLoading}>
            Send feedback
          </Button>
        </form>
      )}
      {isPaid && feedbackSubmitted && (
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Thank you for your feedback.
        </p>
      )}
    </div>
  )
}
