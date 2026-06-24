import { useSocket } from '../context/SocketContext'
import { Bell, Check, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'

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
  const { notifications, markRead, markAllRead, deleteNotification } = useSocket()

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: 22, minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Topbar */}
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'No unread notifications'}
        statText="Live updates from your workspace"
        statColor="#533afd"
      />
      {unreadCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button onClick={markAllRead}
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 9999, fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--border-input)' }}>
          <Bell size={28} style={{ marginBottom: 10 }} />
          <div style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>No notifications yet</div>
          <div style={{ fontSize: 11, marginTop: 6, color: 'var(--border-input)' }}>You'll see live updates here when tasks are assigned or change status.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div key={n.id} style={{
              borderRadius: 12,
              border: `1px solid ${n.is_read ? '#e3e8ee' : '#dcd9fb'}`,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: n.is_read ? '#fff' : '#f5f4fe',
              transition: 'all 0.2s'
            }}>
              {/* Icon */}
              <div style={{ width: 36, height: 36, borderRadius: 10, background: n.is_read ? '#f6f9fc' : '#eeedfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bell size={16} color={n.is_read ? '#a8c3de' : '#534ab7'} strokeWidth={2} />
              </div>

              {/* Body */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4, marginBottom: 3, fontWeight: n.is_read ? 400 : 500 }}>
                  {n.message}
                </div>
                <div style={{ fontSize: 11, color: 'var(--border-input)' }}>{fmt(n.created_at)}</div>
              </div>

              {/* Unread dot */}
              {!n.is_read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }} />
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)}
                    style={{ padding: '5px 12px', borderRadius: 9999, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #dcd9fb', background: '#f5f4fe', color: '#534ab7', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={10} /> Mark read
                  </button>
                )}
                <button onClick={() => deleteNotification(n.id)}
                  style={{ padding: '5px 12px', borderRadius: 9999, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #f7d4d0', background: '#fdecea', color: '#ea2261', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <X size={10} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}