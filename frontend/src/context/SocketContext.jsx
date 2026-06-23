import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const socket = io('http://localhost:8000', {
      path: '/socket.io',
      auth: { token: `Bearer ${token}` },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
    })

    socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message)
    })

    socket.on('task_assigned', (data) => {
  console.log('Received task_assigned:', data)
  setNotifications(prev => [{ id: Date.now(), message: data.message, is_read: false, created_at: new Date().toISOString() }, ...prev])
})

    socket.on('status_changed', (data) => {
      setNotifications(prev => [{ id: Date.now(), message: data.message, is_read: false, created_at: new Date().toISOString() }, ...prev])
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <SocketContext.Provider value={{ notifications, markRead, markAllRead, deleteNotification }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}