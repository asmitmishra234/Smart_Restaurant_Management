import axiosInstance from '../../services/axiosInstance.js'

export async function fetchSalesReport({ startDate, endDate }) {
  const response = await axiosInstance.get('/reports/sales', {
    params: { startDate, endDate },
  })
  return response.data.data
}
