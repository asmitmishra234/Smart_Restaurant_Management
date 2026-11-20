import axiosInstance from '../../services/axiosInstance.js'

export async function fetchCategories() {
  const response = await axiosInstance.get('/categories/admin/all')
  return response.data.data
}

export async function fetchActiveCategories() {
  const response = await axiosInstance.get('/categories')
  return response.data.data
}

export async function createCategory(category) {
  const response = await axiosInstance.post('/categories', category)
  return response.data.data
}

export async function updateCategory({ id, changes }) {
  const response = await axiosInstance.put(`/categories/${id}`, changes)
  return response.data.data
}

export async function toggleCategoryStatus(id) {
  const response = await axiosInstance.patch(`/categories/${id}/status`)
  return response.data.data
}

export async function deleteCategory(id) {
  await axiosInstance.delete(`/categories/${id}`)
  return id
}
