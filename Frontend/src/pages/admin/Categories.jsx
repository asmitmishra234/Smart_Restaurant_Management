import { useEffect, useState } from 'react'
import { FolderOpen, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Input from '../../components/common/Input.jsx'
import Modal from '../../components/common/Modal.jsx'
import {
  addCategory,
  changeCategoryStatus,
  fetchCategories,
  removeCategory,
  saveCategory,
} from '../../features/categories/categorySlice.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

const emptyForm = { name: '', description: '', image: '' }

export default function Categories() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector((state) => state.categories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const openCreate = () => {
    setEditingCategory(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEdit = (category) => {
    setEditingCategory(category)
    setForm({
      name: category.name ?? '',
      description: category.description ?? '',
      image: category.image ?? '',
    })
    setIsModalOpen(true)
  }

  const updateForm = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
    }

    try {
      if (editingCategory) {
        await dispatch(
          saveCategory({ id: editingCategory._id, changes: payload }),
        ).unwrap()
        toast.success('Category updated.')
      } else {
        await dispatch(addCategory(payload)).unwrap()
        toast.success('Category created.')
      }
      setIsModalOpen(false)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to save category.'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (category) => {
    try {
      await dispatch(changeCategoryStatus(category._id)).unwrap()
      toast.success(
        category.isActive ? 'Category deactivated.' : 'Category activated.',
      )
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to update category.'))
    }
  }

  const handleDelete = async () => {
    try {
      await dispatch(removeCategory(deletingCategory._id)).unwrap()
      toast.success('Category deleted.')
      setDeletingCategory(null)
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, 'Unable to delete category.'))
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-500">
          Organize the categories shown in your customer menu.
        </p>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" className="size-4" />
          Add category
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
            onClick={() => dispatch(fetchCategories())}
          >
            Retry
          </Button>
        </div>
      ) : items.length ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((category) => (
            <article
              key={category._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {category.image ? (
                <img
                  src={category.image}
                  alt=""
                  className="h-32 w-full object-cover"
                />
              ) : (
                <div className="flex h-32 items-center justify-center bg-brand-50 text-brand-700">
                  <FolderOpen aria-hidden="true" className="size-8" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-ink-950">
                      {category.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {category.description || 'No description provided.'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${category.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    aria-pressed={category.isActive}
                    onClick={() => handleToggle(category)}
                    className="text-xs font-medium text-slate-500 hover:text-brand-700"
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${category.name}`}
                      onClick={() => openEdit(category)}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Delete ${category.name}`}
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => setDeletingCategory(category)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Tags}
          title="No categories yet"
          description="Create categories to keep the customer menu organized."
          action={<Button onClick={openCreate}>Add category</Button>}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit category' : 'Create category'}
        description="Category details are saved to your restaurant menu."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" form="category-form" loading={saving}>
              Save category
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category name"
            required
            maxLength={80}
            value={form.name}
            onChange={(event) => updateForm('name', event.target.value)}
            placeholder="e.g. Small plates"
          />
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => updateForm('description', event.target.value)}
              rows={3}
              maxLength={300}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <Input
            label="Image URL"
            type="url"
            value={form.image}
            onChange={(event) => updateForm('image', event.target.value)}
            placeholder="https://…"
            description="The current backend stores image URLs; it does not expose an upload endpoint."
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        description={`“${deletingCategory?.name ?? ''}” will be removed. Existing products may still reference it.`}
        confirmLabel="Delete category"
        destructive
      />
    </div>
  )
}
