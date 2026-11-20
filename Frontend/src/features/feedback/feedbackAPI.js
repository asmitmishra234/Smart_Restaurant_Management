import axiosInstance from '../../services/axiosInstance.js'

function sessionHeaders(sessionToken) {
  return { headers: { 'x-session-token': sessionToken } }
}

export async function fetchFeedback() {
  const response = await axiosInstance.get('/feedback')
  return response.data.data
}

export async function createFeedback({ sessionToken, rating, review }) {
  const response = await axiosInstance.post(
    '/feedback',
    { rating, review },
    sessionHeaders(sessionToken),
  )
  return response.data.data
}

export async function deleteFeedback(id) {
  await axiosInstance.delete(`/feedback/${id}`)
  return id
}
