import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useSocket } from '../context/SocketContext'

export default function PageHeader({ title, subtitle, statText, statColor = '#ea2261', rightContent }) {
  const navigate = useNavigate()
  const { notifications } = useSocket()
  const unreadCount = notifications?.filter(n => !n.is_read).length || 0
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, boxShadow: '0 4px 16px rgba(13,37,61,0.10)' }}>
      <div style={{
        background: 'linear-gradient(100deg, #2e2b8c 0%, #533afd 45%, #a855c4 75%, #ea2261 100%)',
        padding: '18px 20px'
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 22, color: '#fff', letterSpacing: '-0.3px' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: '#e8e4fd', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      <div style={{ background: 'var(--bg-card)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {statText && (
            <>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: statColor, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text)' }}>{statText}</span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {rightContent && <div>{rightContent}</div>}
          <button
            onClick={() => navigate('/notifications')}
            className="w-8 h-8 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center hover:border-[#533afd] transition shadow-sm relative"
            title="Notifications"
          >
            <Bell size={16} color="#64748d" strokeWidth={2} />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ea2261] rounded-full border-2 border-white" />}
          </button>
        </div>
      </div>
    </div>
  )
}