import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be configured for this build.')
}

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
})

export default axiosInstance
