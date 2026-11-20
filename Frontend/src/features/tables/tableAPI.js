import axiosInstance from '../../services/axiosInstance.js'

export async function fetchTables() {
  const response = await axiosInstance.get('/tables')
  return response.data.data
}

export async function createTable(table) {
  const response = await axiosInstance.post('/tables', table)
  return response.data.data
}

export async function updateTable({ id, changes }) {
  const response = await axiosInstance.put(`/tables/${id}`, changes)
  return response.data.data
}

export async function toggleTableStatus(id) {
  const response = await axiosInstance.patch(`/tables/${id}/status`)
  return response.data.data
}

export async function deleteTable(id) {
  await axiosInstance.delete(`/tables/${id}`)
  return id
}

export async function scanTableQR(qrToken) {
  const response = await axiosInstance.post('/table-sessions/scan', { qrToken })
  return response.data.data
}
