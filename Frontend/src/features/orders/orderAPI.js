import axiosInstance from '../../services/axiosInstance.js'

function sessionHeaders(sessionToken) {
  return { headers: { 'x-session-token': sessionToken } }
}

export async function fetchOrders() {
  const response = await axiosInstance.get('/orders')
  return response.data.data
}

export async function updateOrderStatus({ id, status }) {
  const response = await axiosInstance.patch(`/orders/${id}/status`, { status })
  return response.data.data
}

export async function createCustomerOrder({ sessionToken, items }) {
  const response = await axiosInstance.post(
    '/orders',
    { items },
    sessionHeaders(sessionToken),
  )
  return response.data.data
}

export async function fetchCustomerOrders(sessionToken) {
  const response = await axiosInstance.get(
    '/orders/my-orders',
    sessionHeaders(sessionToken),
  )
  return response.data.data
}
