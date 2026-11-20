import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function isLoopbackHost(hostname) {
  return (
    hostname === 'localhost' ||
    hostname === '[::1]' ||
    hostname === '0.0.0.0' ||
    /^127(?:\.\d{1,3}){3}$/.test(hostname)
  )
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const apiBaseUrl = loadEnv(mode, '.', 'VITE_').VITE_API_BASE_URL?.trim()

  if (mode === 'production') {
    if (!apiBaseUrl) {
      throw new Error('VITE_API_BASE_URL is required for production builds.')
    }

    let apiUrl
    try {
      apiUrl = new URL(apiBaseUrl)
    } catch {
      throw new Error('VITE_API_BASE_URL must be an absolute HTTPS URL in production.')
    }

    if (apiUrl.protocol !== 'https:' || isLoopbackHost(apiUrl.hostname)) {
      throw new Error('Production VITE_API_BASE_URL must use HTTPS and cannot point to localhost.')
    }
  }

  return {
    plugins: [react(), tailwindcss()],
  }
})
