import { io } from 'socket.io-client'

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
const socketUrl = new URL(apiBaseUrl).origin

let socket

export function getSocket() {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      withCredentials: true,
    })
  }
  return socket
}

export function connectSocket() {
  const connection = getSocket()
  if (!connection.connected) connection.connect()
  return connection
}

export function joinStaffRoom() {
  getSocket().emit('join-staff-room')
}

export function joinTableSession(sessionToken) {
  getSocket().emit('join-table-session', sessionToken)
}

export function disconnectSocket() {
  if (!socket) return
  socket.disconnect()
  socket = undefined
}
