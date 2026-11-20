import { useEffect, useState } from 'react'
import { Armchair, Download, Pencil, Plus, QrCode, Trash2 } from 'lucide-react'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Input from '../../components/common/Input.jsx'
import Modal from '../../components/common/Modal.jsx'
import {
  addTable,
  changeTableStatus,
  fetchTables,
  removeTable,
  saveTable,
} from '../../features/tables/tableSlice.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

const emptyForm = { tableNumber: '', capacity: '2' }

export default function Tables() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.tables)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)
  const [deletingTable, setDeletingTable] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [qrPreview, setQrPreview] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchTables())
  }, [dispatch])

  const openCreate = () => {
    setEditingTable(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEdit = (table) => {
    setEditingTable(table)
    setForm({
      tableNumber: table.tableNumber ?? '',
      capacity: String(table.capacity ?? 2),
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      tableNumber: form.tableNumber.trim(),
      capacity: Number(form.capacity),
    }

    try {
      if (editingTable) {
        await dispatch(
          saveTable({ id: editingTable._id, changes: payload }),
        ).unwrap()
        toast.success('Table updated.')
      } else {
        const result = await dispatch(addTable(payload)).unwrap()
        toast.success('Table created.')
        setQrPreview({
          table: result.table,
          dataUrl: result.qrCode,
          menuUrl: buildMenuUrl(result.table.qrToken),
        })
      }
      setIsModalOpen(false)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to save table.'))
    } finally {
      setSaving(false)
    }
  }

  const buildMenuUrl = (qrToken) =>
    `${window.location.origin}/menu?table=${encodeURIComponent(qrToken)}`

  const showQr = async (table) => {
    setQrLoading(true)
    setQrPreview({ table, dataUrl: null, menuUrl: buildMenuUrl(table.qrToken) })
    try {
      const dataUrl = await QRCode.toDataURL(buildMenuUrl(table.qrToken), {
        width: 320,
        margin: 1,
        color: { dark: '#202725', light: '#ffffff' },
      })
      setQrPreview({ table, dataUrl, menuUrl: buildMenuUrl(table.qrToken) })
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to generate QR code.'))
      setQrPreview(null)
    } finally {
      setQrLoading(false)
    }
  }

  const handleToggle = async (table) => {
    try {
      await dispatch(changeTableStatus(table._id)).unwrap()
      toast.success(table.isActive ? 'Table deactivated.' : 'Table activated.')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to update table.'))
    }
  }

  const handleDelete = async () => {
    try {
      await dispatch(removeTable(deletingTable._id)).unwrap()
      toast.success('Table deleted.')
      setDeletingTable(null)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to delete table.'))
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">
          Manage seating, activation, and customer QR menu access.
        </p>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" className="size-4" />
          Add table
        </Button>
      </section>

      {status === 'loading' && !items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : status === 'failed' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => dispatch(fetchTables())}
          >
            Retry
          </Button>
        </div>
      ) : items.length ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((table) => (
            <article
              key={table._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Armchair aria-hidden="true" className="size-5" />
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${table.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                >
                  {table.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-ink-950">
                Table {table.tableNumber}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Seats {table.capacity} guests
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  aria-pressed={table.isActive}
                  onClick={() => handleToggle(table)}
                  className="text-xs font-medium text-slate-500 hover:text-brand-700"
                >
                  {table.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showQr(table)}
                  >
                    <QrCode aria-hidden="true" className="size-4" />
                    QR
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Edit table ${table.tableNumber}`}
                    onClick={() => openEdit(table)}
                  >
                    <Pencil aria-hidden="true" className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete table ${table.tableNumber}`}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    onClick={() => setDeletingTable(table)}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Armchair}
          title="No tables yet"
          description="Add a table to generate a QR code for its customer menu."
          action={<Button onClick={openCreate}>Add table</Button>}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTable ? 'Edit table' : 'Create table'}
        description="Table number and seating capacity are required."
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" form="table-form" loading={saving}>
              Save table
            </Button>
          </>
        }
      >
        <form id="table-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Table number"
            required
            maxLength={20}
            value={form.tableNumber}
            onChange={(event) =>
              setForm((current) => ({ ...current, tableNumber: event.target.value }))
            }
            placeholder="e.g. 12"
          />
          <Input
            label="Seating capacity"
            type="number"
            min="1"
            step="1"
            required
            value={form.capacity}
            onChange={(event) =>
              setForm((current) => ({ ...current, capacity: event.target.value }))
            }
          />
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(qrPreview)}
        onClose={() => setQrPreview(null)}
        title={qrPreview ? `Table ${qrPreview.table.tableNumber} QR code` : 'QR code'}
        description="Customers can scan this code to open the RestoFlow menu."
        size="sm"
        footer={
          qrPreview?.dataUrl && (
            <a
              href={qrPreview.dataUrl}
              download={`restoflow-table-${qrPreview.table.tableNumber}.png`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
            >
              <Download aria-hidden="true" className="size-4" />
              Download QR
            </a>
          )
        }
      >
        <div className="flex flex-col items-center text-center">
          {qrLoading ? (
            <div className="size-56 animate-pulse rounded-xl bg-slate-200" />
          ) : (
            qrPreview?.dataUrl && (
              <img
                src={qrPreview.dataUrl}
                alt={`QR code for table ${qrPreview.table.tableNumber}`}
                className="size-56 rounded-xl border border-slate-100 p-2"
              />
            )
          )}
          {qrPreview?.menuUrl && (
            <p className="mt-3 max-w-full break-all text-xs text-slate-500">
              {qrPreview.menuUrl}
            </p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingTable)}
        onClose={() => setDeletingTable(null)}
        onConfirm={handleDelete}
        title="Delete table?"
        description={`Table ${deletingTable?.tableNumber ?? ''} will be removed from management.`}
        confirmLabel="Delete table"
        destructive
      />
    </div>
  )
}
