import axiosInstance from '../../services/axiosInstance.js'

function sessionHeaders(sessionToken) {
  return { headers: { 'x-session-token': sessionToken } }
}

export async function fetchInvoices() {
  const response = await axiosInstance.get('/invoices')
  return response.data.data
}

export async function generateCustomerInvoice(sessionToken) {
  const response = await axiosInstance.post(
    '/invoices/generate',
    {},
    sessionHeaders(sessionToken),
  )
  return response.data.data
}

export async function fetchCustomerInvoice(sessionToken) {
  const response = await axiosInstance.get(
    '/invoices/my-invoice',
    sessionHeaders(sessionToken),
  )
  return response.data.data
}
