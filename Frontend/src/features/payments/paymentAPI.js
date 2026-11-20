import axiosInstance from '../../services/axiosInstance.js'

function sessionHeaders(sessionToken) {
  return { headers: { 'x-session-token': sessionToken } }
}

export async function createCashPayment(sessionToken) {
  const response = await axiosInstance.post(
    '/payments',
    { paymentMethod: 'CASH' },
    sessionHeaders(sessionToken),
  )
  return response.data.data
}

export async function confirmCashPayment(id) {
  const response = await axiosInstance.patch(`/payments/${id}/confirm-cash`)
  return response.data.data
}

export async function createOnlinePaymentOrder(sessionToken) {
  const response = await axiosInstance.post(
    '/payments/razorpay/create-order',
    {},
    sessionHeaders(sessionToken),
  )
  return response.data.data
}

export async function verifyOnlinePayment({ sessionToken, paymentDetails }) {
  const response = await axiosInstance.post(
    '/payments/razorpay/verify',
    paymentDetails,
    sessionHeaders(sessionToken),
  )
  return response.data.data
}
