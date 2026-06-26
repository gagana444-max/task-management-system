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
    <div className="font-['Inter'] p-[22px] min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">

      {/* Topbar */}
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'No unread notifications'}
        statText="Live updates from your workspace"
        statColor="#533afd"
      />
      
      {unreadCount > 0 && (
        <div className="flex justify-end mb-4">
          <button onClick={markAllRead}
            className="bg-[var(--primary)] text-white border-none py-2 px-4 rounded-full text-xs cursor-pointer font-['Inter'] font-normal hover:bg-[var(--primary-deep)] transition-colors">
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification list */}
      {notifications.length === 0 ? (
        <div className="text-center py-[60px] text-[var(--border-input)] flex flex-col items-center">
          <Bell size={28} className="mb-2.5 opacity-50" />
          <div className="text-[13px] font-normal text-[var(--text-muted)]">No notifications yet</div>
          <div className="text-[11px] mt-1.5 text-[var(--border-input)]">You'll see live updates here when tasks are assigned or change status.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(n => (
            <div key={n.id} className={`
              rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200 border
              ${n.is_read 
                ? 'border-[var(--border)] bg-[var(--bg-card)]' 
                : 'border-[var(--primary-subdued)] bg-[var(--bg-hover)] dark:border-[var(--primary-press)] dark:bg-[var(--bg-active)]'}
            `}>
              {/* Icon */}
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 
                ${n.is_read ? 'bg-[var(--bg)]' : 'bg-[var(--primary-subdued)]/20'}
              `}>
                <Bell size={16} className={n.is_read ? 'text-[var(--border-input)]' : 'text-[var(--primary)]'} strokeWidth={2} />
              </div>

              {/* Body */}
              <div className="flex-1">
                <div className={`text-[13px] text-[var(--text)] leading-[1.4] mb-[3px] ${n.is_read ? 'font-normal' : 'font-medium'}`}>
                  {n.message}
                </div>
                <div className="text-[11px] text-[var(--border-input)]">{fmt(n.created_at)}</div>
              </div>

              {/* Unread dot */}
              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0" />
              )}

              {/* Actions */}
              <div className="flex gap-1.5 shrink-0">
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)}
                    className="py-1 px-3 rounded-full text-[10px] font-normal cursor-pointer font-['Inter'] border border-[var(--primary-subdued)] bg-[var(--primary-subdued)]/10 text-[var(--primary)] flex items-center gap-1 hover:bg-[var(--primary-subdued)]/20 transition-colors">
                    <Check size={10} /> Mark read
                  </button>
                )}
                <button onClick={() => deleteNotification(n.id)}
                  className="py-1 px-3 rounded-full text-[10px] font-normal cursor-pointer font-['Inter'] border border-[var(--danger-border)] bg-[var(--danger-bg)] text-[var(--danger)] flex items-center gap-1 hover:opacity-80 transition-opacity">
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