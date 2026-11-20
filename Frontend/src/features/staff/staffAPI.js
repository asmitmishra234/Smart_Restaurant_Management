import axiosInstance from '../../services/axiosInstance.js'

export async function fetchStaff() {
  const response = await axiosInstance.get('/staff')
  return response.data.data
}

export async function createStaff(staff) {
  const response = await axiosInstance.post('/staff', staff)
  const member = response.data.data
  return { ...member, _id: member._id ?? member.id }
}

export async function updateStaff({ id, changes }) {
  const response = await axiosInstance.put(`/staff/${id}`, changes)
  return response.data.data
}

export async function toggleStaffStatus(id) {
  const response = await axiosInstance.patch(`/staff/${id}/status`)
  return response.data.data
}
