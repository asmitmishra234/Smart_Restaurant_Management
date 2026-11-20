import axiosInstance from '../../services/axiosInstance.js'

export async function loginRequest(credentials) {
  const response = await axiosInstance.post('/auth/login', credentials)
  return response.data.data
}

export async function currentUserRequest() {
  const response = await axiosInstance.get('/auth/me')
  return response.data.data
}

export async function logoutRequest() {
  const response = await axiosInstance.post('/auth/logout')
  return response.data
}
