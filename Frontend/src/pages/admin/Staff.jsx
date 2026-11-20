import { useEffect, useState } from 'react'
import { Pencil, Plus, UserRound, UsersRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Input from '../../components/common/Input.jsx'
import Modal from '../../components/common/Modal.jsx'
import {
  addStaffMember,
  changeStaffStatus,
  fetchStaff,
  saveStaffMember,
} from '../../features/staff/staffSlice.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'WAITER',
}

export default function Staff() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.staff)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchStaff())
  }, [dispatch])

  const openCreate = () => {
    setEditingMember(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEdit = (member) => {
    setEditingMember(member)
    setForm({
      name: member.name ?? '',
      email: member.email ?? '',
      phone: member.phone ?? '',
      password: '',
      role: member.role ?? 'WAITER',
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const { email, password, ...details } = form
    try {
      if (editingMember) {
        await dispatch(
          saveStaffMember({
            id: editingMember._id,
            changes: details,
          }),
        ).unwrap()
        toast.success('Staff details updated.')
      } else {
        await dispatch(
          addStaffMember({
            ...details,
            email: email.trim().toLowerCase(),
            password,
          }),
        ).unwrap()
        toast.success('Staff account created.')
      }
      setIsModalOpen(false)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to save staff member.'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (member) => {
    try {
      await dispatch(changeStaffStatus(member._id)).unwrap()
      toast.success(member.isActive ? 'Staff account deactivated.' : 'Staff account activated.')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to update staff status.'))
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">
          Create and manage Kitchen and Waiter access. Admin registration is not available here.
        </p>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" className="size-4" />
          Add staff
        </Button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {status === 'loading' && !items.length ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : status === 'failed' ? (
          <div className="p-5">
            <p className="text-sm text-rose-700">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => dispatch(fetchStaff())}
            >
              Retry
            </Button>
          </div>
        ) : items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Team member</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((member) => (
                  <tr key={member._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                          <UserRound aria-hidden="true" className="size-4" />
                        </span>
                        <div>
                          <p className="font-medium text-ink-950">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{member.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${member.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          aria-pressed={member.isActive}
                          onClick={() => handleToggle(member)}
                          className="text-xs font-medium text-slate-500 hover:text-brand-700"
                        >
                          {member.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Edit ${member.name}`}
                          onClick={() => openEdit(member)}
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={UsersRound}
              title="No staff accounts yet"
              description="Create an account for a kitchen or service team member."
              action={<Button onClick={openCreate}>Add staff</Button>}
            />
          </div>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit staff member' : 'Create staff account'}
        description="Only Kitchen and Waiter staff accounts can be created here."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" form="staff-form" loading={saving}>
              Save staff
            </Button>
          </>
        }
      >
        <form id="staff-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full name"
            required
            maxLength={100}
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
          {!editingMember && (
            <>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
              />
              <Input
                label="Temporary password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                description="Use at least 8 characters."
              />
            </>
          )}
          <Input
            label="Phone (optional)"
            type="tel"
            value={form.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
          />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value }))
              }
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            >
              <option value="WAITER">Waiter</option>
              <option value="KITCHEN">Kitchen</option>
            </select>
          </label>
        </form>
      </Modal>
    </div>
  )
}
