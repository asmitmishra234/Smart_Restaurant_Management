import axiosInstance from '../../services/axiosInstance.js'

function toApiDate(date) {
  return date.toISOString().slice(0, 10)
}

export async function getDashboardOverview() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 29)

  const [statsResponse, ordersResponse, reportResponse] = await Promise.all([
    axiosInstance.get('/dashboard/stats'),
    axiosInstance.get('/orders'),
    axiosInstance.get('/reports/sales', {
      params: {
        startDate: toApiDate(start),
        endDate: toApiDate(end),
      },
    }),
  ])

  return {
    stats: statsResponse.data.data,
    orders: ordersResponse.data.data,
    report: reportResponse.data.data,
  }
}
