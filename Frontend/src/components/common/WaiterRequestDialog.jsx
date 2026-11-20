import { useState } from 'react'
import toast from 'react-hot-toast'
import Button from './Button.jsx'
import Modal from './Modal.jsx'
import { sendWaiterRequest } from '../../features/waiterRequests/waiterRequestSlice.js'
import { useAppDispatch } from '../../app/hooks.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

const requestTypes = [
  ['WATER', 'Water'],
  ['EXTRA_PLATES', 'Extra plates'],
  ['CUTLERY', 'Cutlery'],
  ['CLEANING', 'Table cleaning'],
  ['OTHER', 'Other'],
]

export default function WaiterRequestDialog({ isOpen, onClose, session }) {
  const dispatch = useAppDispatch()
  const [requestType, setRequestType] = useState('WATER')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!session?.sessionToken) {
      toast.error('Scan the table QR code before requesting service.')
      return
    }

    setLoading(true)
    try {
      await dispatch(
        sendWaiterRequest({
          sessionToken: session.sessionToken,
          requestType,
          message: message.trim(),
        }),
      ).unwrap()
      toast.success('Your request was sent to the service team.')
      setMessage('')
      onClose()
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to send request.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request service"
      description={`Let the team know what you need${session?.tableNumber ? ` at table ${session.tableNumber}` : ''}.`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" form="waiter-request-form" loading={loading}>
            Send request
          </Button>
        </>
      }
    >
      <form
        id="waiter-request-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Request</span>
          <select
            value={requestType}
            onChange={(event) => setRequestType(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          >
            {requestTypes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">
            Additional details <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value.slice(0, 300))}
            rows={3}
            maxLength={300}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            placeholder="Add a short note"
          />
          <span className="block text-right text-xs text-slate-400">
            {message.length}/300
          </span>
        </label>
      </form>
    </Modal>
  )
}
