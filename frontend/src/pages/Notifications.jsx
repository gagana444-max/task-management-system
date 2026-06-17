import { useState, useEffect } from 'react'
import api from '../api/axios'

const fmt = (d) => {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = now - date
  if (diff < 86400000) return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  if (diff < 172800000) return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ` at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch {
      // Use mock data if API not ready
      setNotifications([
        { id: 1, message: 'You have been assigned to task: Design Homepage', is_read: false, created_at: new Date().toISOString() },
        { id: 2, message: 'Task status changed to: in_progress — Polish UI components', is_read: false, created_at: new Date(Date.now() - 900000).toISOString() },
        { id: 3, message: 'You have been assigned to task: Test notification system', is_read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 4, message: 'Task status changed to: completed — Setup database schema', is_read: true, created_at: new Date(Date.now() - 90000000).toISOString() },
        { id: 5, message: 'You have been assigned to task: Create API endpoints', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
    } catch { }
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
    } catch { }
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
    } catch { }
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", padding: 22, minHeight: '100vh', background: '#f5f4f0' }}>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 22, color: '#1a1a2e', letterSpacing: '-0.5px' }}>Notifications</h1>
          <p style={{ fontSize: 11, color: '#9090a0', marginTop: 2 }}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            style={{ background: '#1a1a2e', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500 }}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9090a0', fontSize: 13 }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9090a0' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>No notifications yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              borderRadius: 12,
              border: `1.5px solid ${n.is_read ? '#e8e8f0' : '#ddd6fe'}`,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: n.is_read ? '#fff' : '#f5f3ff',
              transition: 'all 0.2s'
            }}>
              {/* Icon */}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: n.is_read ? '#f0f0f8' : '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                🔔
              </div>

              {/* Body */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#1a1a2e', lineHeight: 1.4, marginBottom: 3, fontWeight: n.is_read ? 400 : 600 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: 11, color: '#b0b0c0' }}>{fmt(n.created_at)}</div>
              </div>

              {/* Unread dot */}
              {!n.is_read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#818cf8', flexShrink: 0 }} />
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)}
                    style={{ padding: '5px 10px', borderRadius: 6, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #ddd6fe', background: '#f5f3ff', color: '#7c3aed' }}>
                    Mark read
                  </button>
                )}
                <button onClick={() => deleteNotif(n.id)}
                  style={{ padding: '5px 10px', borderRadius: 6, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #fecaca', background: '#fff5f5', color: '#dc2626' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}