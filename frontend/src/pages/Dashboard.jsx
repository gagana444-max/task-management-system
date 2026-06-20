import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const ini = (name) => name?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'
const avc = (n) => ['#818cf8', '#34d399', '#60a5fa', '#f472b6', '#fb923c'][n?.charCodeAt(0) % 5] || '#818cf8'
const normalizeStatus = (s) => {
  if (!s) return 'todo'
  const map = { 'to do': 'todo', 'in progress': 'in_progress', 'done': 'completed', 'todo': 'todo', 'in_progress': 'in_progress', 'completed': 'completed' }
  return map[s.toLowerCase()] || 'todo'
}
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''
const statusDot = { todo: '#f59e0b', in_progress: '#3b82f6', completed: '#10b981' }

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/tasks').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
      ])
      setTasks(tasksRes.data)
      setUsers(usersRes.data)
    } finally {
      setLoading(false)
    }
  }

  const getUserName = (assigned_user_id) => {
    if (!assigned_user_id) return null
    const u = users.find(u => u.id === assigned_user_id)
    return u ? u.name : null
  }

  const todoCount = tasks.filter(t => normalizeStatus(t.status) === 'todo').length
  const inProgressCount = tasks.filter(t => normalizeStatus(t.status) === 'in_progress').length
  const completedCount = tasks.filter(t => normalizeStatus(t.status) === 'completed').length
  const totalTasks = tasks.length
  const completedPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
  const activeUsers = users.filter(u => u.is_active).length

  const stats = [
    { icon: '📋', label: 'Total Tasks', value: totalTasks, trend: 'pending', trendLabel: `${todoCount} pending`, bg: '#fef9e7', ibg: '#fef3c7' },
    { icon: '⚡', label: 'In Progress', value: inProgressCount, trend: 'up', trendLabel: 'Active', bg: '#eff6ff', ibg: '#dbeafe' },
    { icon: '✅', label: 'Completed', value: completedCount, trend: 'up', trendLabel: `${completedPct}%`, bg: '#ecfdf5', ibg: '#d1fae5' },
    { icon: '👥', label: 'Team Members', value: activeUsers, trend: 'up', trendLabel: 'Active', bg: '#fdf4ff', ibg: '#f3e8ff' },
  ]

  // Recent tasks: most recently created, top 5
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5)

  // Upcoming deadlines: tasks with due dates, not completed, soonest first
  const now = new Date()
  const upcoming = tasks
    .filter(t => t.due_date && normalizeStatus(t.status) !== 'completed')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)
    .map(t => {
      const due = new Date(t.due_date)
      const diffDays = Math.ceil((due - now) / 86400000)
      const urgency = diffDays < 0 ? 'urgent' : diffDays <= 3 ? 'urgent' : diffDays <= 7 ? 'soon' : 'ok'
      const dateLabel = diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : fmtShort(t.due_date)
      return { title: t.title, date: dateLabel, urgency }
    })

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
              {loading ? '—' : s.value}
            </div>
            <div style={{ fontSize: 11, color: '#9090a0', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Deadlines — full width since no projects */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', padding: 16, marginBottom: 14 }}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>Upcoming Deadlines</span>
          <span onClick={() => navigate('/tasks')} style={{ fontSize: 11, color: '#818cf8', cursor: 'pointer' }}>See all →</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#b0b0c0', fontSize: 12 }}>Loading...</div>
        ) : upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#b0b0c0', fontSize: 12 }}>No upcoming deadlines.</div>
        ) : upcoming.map(d => {
          const s = urgencyStyle[d.urgency]
          return (
            <div key={d.title} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '8px 10px', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: s.color }}>{d.title}</span>
              <span style={{ fontSize: 11, color: '#9090a0' }}>{d.date}</span>
            </div>
          )
        })}
      </div>

      {/* Recent Tasks */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', padding: 16 }}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 14, color: '#1a1a2e' }}>Recent Tasks</span>
          <span onClick={() => navigate('/tasks')} style={{ fontSize: 11, color: '#818cf8', cursor: 'pointer' }}>View board →</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#b0b0c0', fontSize: 12 }}>Loading...</div>
        ) : recentTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#b0b0c0', fontSize: 12 }}>No tasks yet. Create one from the Task Board.</div>
        ) : recentTasks.map(t => {
          const ns = normalizeStatus(t.status)
          const assignedName = getUserName(t.assigned_user_id)
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f0f0f8', cursor: 'pointer' }} onClick={() => navigate(`/tasks/${t.id}`)}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusDot[ns], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#1a1a2e', fontWeight: 500, flex: 1 }}>{t.title}</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: assignedName ? avc(assignedName) : '#d0d0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {assignedName ? ini(assignedName) : '?'}
              </div>
              <span style={{ fontSize: 11, color: '#b0b0c0' }}>{fmtShort(t.due_date)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}