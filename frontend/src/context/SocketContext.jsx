import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { toast } from 'react-toastify'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!user || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const socketUrl = apiUrl.replace(/\/api\/?$/, '')

    const newSocket = io(socketUrl, {
      path: '/socket.io',
      auth: { token: `Bearer ${token}` },
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
    })

    newSocket.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message)
    })

    newSocket.on('task_assigned', (data) => {
      console.log('Received task_assigned:', data)
      setNotifications(prev => [{ id: Date.now(), message: data.message, is_read: false, created_at: new Date().toISOString() }, ...prev])
      toast.info(`🔔 ${data.message}`)
    })

    newSocket.on('status_changed', (data) => {
      console.log('Received status_changed:', data)
      setNotifications(prev => [{ id: Date.now(), message: data.message, is_read: false, created_at: new Date().toISOString() }, ...prev])
      toast.info(`📋 ${data.message}`)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      setSocket(null)
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
    <SocketContext.Provider value={{ socket, notifications, markRead, markAllRead, deleteNotification }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) throw new Error('useSocket must be used within SocketProvider')
  return context
}