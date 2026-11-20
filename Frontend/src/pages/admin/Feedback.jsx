import { useEffect, useState } from 'react'
import { MessageSquareText, Star, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { LoadingSkeleton } from '../../components/common/Loader.jsx'
import { fetchFeedback, removeFeedback } from '../../features/feedback/feedbackSlice.js'
import { formatDateTime } from '../../utils/formatters.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

export default function Feedback() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.feedback)
  const [deletingFeedback, setDeletingFeedback] = useState(null)

  useEffect(() => {
    dispatch(fetchFeedback())
  }, [dispatch])

  const handleDelete = async () => {
    try {
      await dispatch(removeFeedback(deletingFeedback._id)).unwrap()
      toast.success('Feedback deleted.')
      setDeletingFeedback(null)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to delete feedback.'))
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">
        Customer reviews are linked to paid table sessions.
      </p>
      {status === 'loading' && !items.length ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <LoadingSkeleton key={index} className="h-32" />
          ))}
        </div>
      ) : status === 'failed' && !items.length ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => dispatch(fetchFeedback())}
          >
            Retry
          </Button>
        </div>
      ) : items.length ? (
        <section className="grid gap-3 lg:grid-cols-2">
          {items.map((feedback) => (
            <article
              key={feedback._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className="flex items-center gap-1 text-amber-500"
                    aria-label={`${feedback.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        aria-hidden="true"
                        className={`size-4 ${index < feedback.rating ? 'fill-current' : 'text-slate-200'}`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-semibold text-slate-600">
                      {feedback.rating}/5
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {feedback.review || 'No written review.'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Delete feedback"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => setDeletingFeedback(feedback)}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                <span>Table {feedback.table?.tableNumber ?? '—'}</span>
                <span>{feedback.invoice?.invoiceNumber ?? '—'}</span>
                <span>{formatDateTime(feedback.createdAt)}</span>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={MessageSquareText}
          title="No feedback yet"
          description="Customer ratings and reviews will appear here after paid visits."
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingFeedback)}
        onClose={() => setDeletingFeedback(null)}
        onConfirm={handleDelete}
        title="Delete customer feedback?"
        description="This removes the selected review from RestoFlow."
        confirmLabel="Delete feedback"
        destructive
      />
    </div>
  )
}
