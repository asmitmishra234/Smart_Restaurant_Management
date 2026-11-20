import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Input from '../../components/common/Input.jsx'
import Loader, { LoadingSkeleton } from '../../components/common/Loader.jsx'
import Modal from '../../components/common/Modal.jsx'
import {
  addProduct,
  changeProductAvailability,
  fetchProducts,
  removeProduct,
  saveProduct,
} from '../../features/products/productSlice.js'
import { fetchCategories } from '../../features/categories/categorySlice.js'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { formatCurrency } from '../../utils/formatters.js'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  foodType: 'VEG',
  preparationTime: '15',
  image: '',
}

function ProductForm({
  form,
  categories,
  categoriesStatus,
  categoriesError,
  onRetryCategories,
  onChange,
  onSubmit,
  saving,
}) {
  const activeCategories = categories.filter((category) => category.isActive)

  return (
    <form id="product-form" onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Product name"
        required
        maxLength={100}
        value={form.name}
        onChange={(event) => onChange('name', event.target.value)}
        placeholder="e.g. Garden harvest bowl"
      />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea
          value={form.description}
          onChange={(event) => onChange('description', event.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-ink-950 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          placeholder="Describe this menu item"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Price (INR)"
          type="number"
          min="0"
          step="0.01"
          required
          value={form.price}
          onChange={(event) => onChange('price', event.target.value)}
        />
        <Input
          label="Preparation time (minutes)"
          type="number"
          min="1"
          step="1"
          required
          value={form.preparationTime}
          onChange={(event) => onChange('preparationTime', event.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              required
              disabled={!activeCategories.length}
              value={form.category}
              onChange={(event) => onChange('category', event.target.value)}
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="">
                {categoriesStatus === 'loading'
                  ? 'Loading categories…'
                  : activeCategories.length
                    ? 'Select category'
                    : 'No active categories'}
              </option>
              {activeCategories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          {categoriesStatus === 'failed' && (
            <div className="space-y-1">
              <p role="alert" className="text-xs text-rose-600">
                {categoriesError || 'Unable to load categories.'}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="px-0 text-brand-700"
                onClick={onRetryCategories}
              >
                Retry categories
              </Button>
            </div>
          )}
          {categoriesStatus === 'succeeded' && !activeCategories.length && (
            <p className="text-xs leading-5 text-amber-700">
              Add or activate a category before creating a product.{' '}
              <Link
                to="/admin/categories"
                className="font-semibold underline underline-offset-2"
              >
                Manage categories
              </Link>
            </p>
          )}
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Food type</span>
          <select
            value={form.foodType}
            onChange={(event) => onChange('foodType', event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          >
            <option value="VEG">Vegetarian</option>
            <option value="NON_VEG">Non-vegetarian</option>
            <option value="EGG">Contains egg</option>
          </select>
        </label>
      </div>
      <Input
        label="Image URL"
        type="url"
        value={form.image}
        onChange={(event) => onChange('image', event.target.value)}
        placeholder="https://…"
        description="The current backend accepts an image URL; it has no image-upload endpoint."
      />
      <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
        <UtensilsCrossed aria-hidden="true" className="size-4 shrink-0 text-brand-600" />
        Product availability is managed separately after saving.
      </div>
      <Button type="submit" className="sr-only" loading={saving}>
        Save product
      </Button>
    </form>
  )
}

export default function Products() {
  const dispatch = useAppDispatch()
  const products = useAppSelector((state) => state.products)
  const categoriesState = useAppSelector((state) => state.categories)
  const categories = categoriesState.items
  const activeCategories = categories.filter((category) => category.isActive)
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchCategories())
  }, [dispatch])

  const visibleProducts = useMemo(() => {
    const search = query.trim().toLowerCase()
    return products.items.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search)
      const categoryId =
        typeof product.category === 'object'
          ? product.category?._id
          : product.category
      const matchesCategory =
        categoryFilter === 'all' || categoryId === categoryFilter
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && product.isAvailable) ||
        (availabilityFilter === 'unavailable' && !product.isAvailable)
      return matchesSearch && matchesCategory && matchesAvailability
    })
  }, [products.items, query, categoryFilter, availabilityFilter])

  const openCreate = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setIsModalOpen(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setForm({
      name: product.name ?? '',
      description: product.description ?? '',
      price: String(product.price ?? ''),
      category:
        typeof product.category === 'object'
          ? product.category?._id ?? ''
          : product.category ?? '',
      foodType: product.foodType ?? 'VEG',
      preparationTime: String(product.preparationTime ?? 15),
      image: product.image ?? '',
    })
    setIsModalOpen(true)
  }

  const updateForm = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!activeCategories.some((category) => category._id === form.category)) {
      toast.error('Select an active category before saving the product.')
      return
    }

    setSaving(true)
    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      preparationTime: Number(form.preparationTime),
    }

    try {
      if (editingProduct) {
        await dispatch(
          saveProduct({ id: editingProduct._id, changes: payload }),
        ).unwrap()
        toast.success('Product updated.')
      } else {
        await dispatch(addProduct(payload)).unwrap()
        toast.success('Product added.')
      }
      setIsModalOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save product.'))
    } finally {
      setSaving(false)
    }
  }

  const handleAvailability = async (product) => {
    try {
      await dispatch(changeProductAvailability(product._id)).unwrap()
      toast.success(
        product.isAvailable ? 'Product marked unavailable.' : 'Product is available.',
      )
    } catch (error) {
      toast.error(error?.message ?? 'Unable to update availability.')
    }
  }

  const handleDelete = async () => {
    try {
      await dispatch(removeProduct(deletingProduct._id)).unwrap()
      toast.success('Product deleted.')
      setDeletingProduct(null)
    } catch (error) {
      toast.error(error?.message ?? 'Unable to delete product.')
    }
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500">
            Manage menu details, food type, price, and availability.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus aria-hidden="true" className="size-4" />
          Add product
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Input
            aria-label="Search products"
            placeholder="Search products…"
            leadingIcon={Search}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-500"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by availability"
          value={availabilityFilter}
          onChange={(event) => setAvailabilityFilter(event.target.value)}
          className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-500"
        >
          <option value="all">Any availability</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </section>

      {products.status === 'loading' && !products.items.length ? (
        <LoadingSkeleton className="h-72" />
      ) : products.status === 'failed' ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p>{products.error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => dispatch(fetchProducts())}
          >
            Retry
          </Button>
        </div>
      ) : visibleProducts.length ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Food type</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Availability</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleProducts.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            className="size-11 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                            <UtensilsCrossed aria-hidden="true" className="size-4" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-950">{product.name}</p>
                          <p className="max-w-56 truncate text-xs text-slate-500">
                            {product.description || `${product.preparationTime} min prep`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {typeof product.category === 'object'
                        ? product.category?.name
                        : categories.find((item) => item._id === product.category)?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {product.foodType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-ink-950">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        aria-pressed={product.isAvailable}
                        onClick={() => handleAvailability(product)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${product.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                      >
                        {product.isAvailable ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Edit ${product.name}`}
                          onClick={() => openEdit(product)}
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete ${product.name}`}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          onClick={() => setDeletingProduct(product)}
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={UtensilsCrossed}
          title={query ? 'No matching products' : 'No products added'}
          description={
            query
              ? 'Try another search or clear the filters.'
              : 'Add your first menu item to get started.'
          }
          action={!query && <Button onClick={openCreate}>Add product</Button>}
        />
      )}

      {products.status === 'loading' && products.items.length > 0 && (
        <Loader label="Refreshing products" />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit product' : 'Add product'}
        description="Product changes are validated by the RestoFlow backend."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="product-form" loading={saving}>
              Save product
            </Button>
          </>
        }
      >
        <ProductForm
          form={form}
          categories={categories}
          categoriesStatus={categoriesState.status}
          categoriesError={categoriesState.error}
          onRetryCategories={() => dispatch(fetchCategories())}
          onChange={updateForm}
          onSubmit={handleSubmit}
          saving={saving}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingProduct)}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={`“${deletingProduct?.name ?? ''}” will be removed from the menu.`}
        confirmLabel="Delete product"
        destructive
      />
    </div>
  )
}
