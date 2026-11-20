import axiosInstance from '../../services/axiosInstance.js'

export async function fetchProducts() {
  const response = await axiosInstance.get('/products/admin/all')
  return response.data.data
}

export async function createProduct(product) {
  const response = await axiosInstance.post('/products', product)
  return response.data.data
}

export async function updateProduct({ id, changes }) {
  const response = await axiosInstance.put(`/products/${id}`, changes)
  return response.data.data
}

export async function toggleProductAvailability(id) {
  const response = await axiosInstance.patch(`/products/${id}/availability`)
  return response.data.data
}

export async function deleteProduct(id) {
  await axiosInstance.delete(`/products/${id}`)
  return id
}

export async function fetchAvailableProducts() {
  const response = await axiosInstance.get('/products')
  return response.data.data
}
