import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const ini = (name) => name?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'

  const stats = [
    { icon: '📋', label: 'Total Tasks', value: '—', trend: 'pending', trendLabel: '0 pending', bg: '#fef9e7', ibg: '#fef3c7' },
    { icon: '◫', label: 'Projects', value: '—', trend: 'up', trendLabel: 'Active', bg: '#eff6ff', ibg: '#dbeafe' },
    { icon: '✅', label: 'Completed', value: '—', trend: 'up', trendLabel: '0%', bg: '#ecfdf5', ibg: '#d1fae5' },
    { icon: '👥', label: 'Team Members', value: '—', trend: 'up', trendLabel: 'Active', bg: '#fdf4ff', ibg: '#f3e8ff' },
  ]

  const recentTasks = [
    { title: 'Design the landing page layout', status: 'todo', assigned: 'Admin User', due: '22 Apr' },
    { title: 'Design login page with full auth flow', status: 'in_progress', assigned: 'Sam', due: '30 May' },
    { title: 'Polish the UI components and fix spacing', status: 'todo', assigned: 'Sam', due: '25 Apr' },
    { title: 'Test notification system end to end', status: 'completed', assigned: 'Sam', due: '30 May' },
  ]

  const deadlines = [
    { title: 'Design landing page', date: 'Tomorrow', urgency: 'urgent' },
    { title: 'Polish UI components', date: '25 Apr', urgency: 'soon' },
    { title: 'Test notification system', date: '30 May', urgency: 'ok' },
  ]

  const progress = [
    { name: 'Website Redesign', pct: 75, color: 'linear-gradient(90deg,#818cf8,#a78bfa)' },
    { name: 'Mobile App', pct: 45, color: 'linear-gradient(90deg,#34d399,#10b981)' },
    { name: 'API Integration', pct: 90, color: 'linear-gradient(90deg,#60a5fa,#3b82f6)' },
  ]

  const statusDot = { todo: '#f59e0b', in_progress: '#3b82f6', completed: '#10b981' }
  const avc = (n) => ['#818cf8', '#34d399', '#60a5fa', '#f472b6', '#fb923c'][n?.charCodeAt(0) % 5] || '#818cf8'

  const urgencyStyle = {
    urgent: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
    soon: { bg: '#fef9e7', border: '#fde68a', color: '#d97706' },
    ok: { bg: '#ecfdf5', border: '#a7f3d0', color: '#059669' },
  }

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif" }} className="p-6 min-h-screen bg-[#f5f4f0]">
      {/* Topbar */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '26px', color: '#1a1a2e', letterSpacing: '-0.8px' }}>
            Dashboard
          </h1>
          <p className="text-sm text-[#9090a0] mt-0.5">Welcome back, {user?.name} 👋</p>
        </div>
        <button
          onClick={() => navigate('/notifications')}
          className="w-9 h-9 rounded-lg bg-white border-[1.5px] border-[#e8e8f0] flex items-center justify-center relative text-base hover:border-[#818cf8] transition"
        >
          🔔
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full border-2 border-[#f5f4f0]" />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '12px', border: '1.5px solid #e8e8f0', padding: '16px' }}>
            <div className="flex items-center justify-between mb-2.5">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                {s.icon}
              </div>
              <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 600, background: s.trend === 'up' ? '#ecfdf5' : '#fef9e7', color: s.trend === 'up' ? '#059669' : '#d97706' }}>
                {s.trendLabel}
              </span>
            </div>
            <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 28, color: '#1a1a2e', lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: '#9090a0', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Two col */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Project Progress */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', padding: 16 }}>
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>Project Progress</span>
            <span style={{ fontSize: 11, color: '#818cf8', cursor: 'pointer' }}>View all →</span>
          </div>
          {progress.map(p => (
            <div key={p.name} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs text-[#1a1a2e] mb-1.5 font-medium">
                <span>{p.name}</span>
                <span className="text-[#9090a0] font-normal">{p.pct}%</span>
              </div>
              <div style={{ height: 7, background: '#f0f0f8', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 10 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Upcoming Deadlines */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', padding: 16 }}>
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>Upcoming Deadlines</span>
            <span style={{ fontSize: 11, color: '#818cf8', cursor: 'pointer' }}>See all →</span>
          </div>
          {deadlines.map(d => {
            const s = urgencyStyle[d.urgency]
            return (
              <div key={d.title} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '8px 10px', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: s.color }}>{d.title}</span>
                <span style={{ fontSize: 11, color: '#9090a0' }}>{d.date}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Tasks */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', padding: 16 }}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>Recent Tasks</span>
          <span onClick={() => navigate('/tasks')} style={{ fontSize: 11, color: '#818cf8', cursor: 'pointer' }}>View board →</span>
        </div>
        {recentTasks.map(t => (
          <div key={t.title} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0f0f8' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusDot[t.status], flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#1a1a2e', fontWeight: 500, flex: 1 }}>{t.title}</span>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: avc(t.assigned), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {ini(t.assigned)}
            </div>
            <span style={{ fontSize: 11, color: '#b0b0c0' }}>{t.due}</span>
          </div>
        ))}
      </div>
    </div>
  )
}