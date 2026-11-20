import axiosInstance from '../../services/axiosInstance.js'

function sessionHeaders(sessionToken) {
  return { headers: { 'x-session-token': sessionToken } }
}

export async function fetchWaiterRequests() {
  const response = await axiosInstance.get('/waiter-requests')
  return response.data.data
}

export async function updateWaiterRequest({ id, status }) {
  const response = await axiosInstance.patch(`/waiter-requests/${id}/status`, {
    status,
  })
  return response.data.data
}

export async function createWaiterRequest({ sessionToken, requestType, message }) {
  const response = await axiosInstance.post(
    '/waiter-requests',
    { requestType, message },
    sessionHeaders(sessionToken),
  )
  return response.data.data
}
