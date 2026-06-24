import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { ClipboardList, Zap, CheckCircle2, Users, Bell } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const ini = (name) => name?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'
const avc = () => '#533afd'
const normalizeStatus = (s) => {
  if (!s) return 'todo'
  const map = { 'to do': 'todo', 'in progress': 'in_progress', 'done': 'completed', 'todo': 'todo', 'in_progress': 'in_progress', 'completed': 'completed' }
  return map[s.toLowerCase()] || 'todo'
}
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''
const statusDot = { todo: '#9b6829', in_progress: '#533afd', completed: '#0f6e56' }
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchData()
  }, [])

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

  const today = new Date()
  const dueTodayCount = tasks.filter(t => t.due_date && normalizeStatus(t.status) !== 'completed' && isSameDay(new Date(t.due_date), today)).length

  const stats = [
    { Icon: ClipboardList, label: 'Total Tasks', value: totalTasks, trendLabel: `${todoCount} pending`, trendBg: '#fdf6e8', trendColor: '#c4922f', chipBg: '#fdf6e8', chipColor: '#c4922f' },
    { Icon: Zap, label: 'In Progress', value: inProgressCount, trendLabel: 'Active', trendBg: '#e1f5ee', trendColor: '#0f6e56', chipBg: '#e6f1fb', chipColor: '#185fa5' },
    { Icon: CheckCircle2, label: 'Completed', value: completedCount, trendLabel: `${completedPct}%`, trendBg: '#e1f5ee', trendColor: '#0f6e56', chipBg: '#e1f5ee', chipColor: '#0f6e56' },
    { Icon: Users, label: 'Team Members', value: activeUsers, trendLabel: 'Active', trendBg: '#e1f5ee', trendColor: '#0f6e56', chipBg: '#eeedfe', chipColor: '#534ab7' },
  ]

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5)

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
    urgent: { dot: '#ea2261', text: '#ea2261' },
    soon: { dot: '#c4922f', text: '#c4922f' },
    ok: { dot: '#64748d', text: '#64748d' },
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="p-6 min-h-screen bg-[#f6f9fc]">

      <PageHeader
        title="Dashboard"
        subtitle={`${getGreeting()}, ${user?.name}`}
        statText={loading ? 'Loading your tasks...' : `You have ${dueTodayCount} task${dueTodayCount !== 1 ? 's' : ''} due today`}
      />

      {/* Notification bell, top right (kept separate from header) */}
      <div className="flex justify-end mb-3" style={{ marginTop: -56 }}>
        <button
          onClick={() => navigate('/notifications')}
          className="w-9 h-9 rounded-lg bg-white border border-[#e3e8ee] flex items-center justify-center relative hover:border-[#533afd] transition"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <Bell size={16} color="#64748d" strokeWidth={2} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e3e8ee', padding: 16 }}>
            <div className="flex items-center justify-between mb-2.5">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.Icon size={17} color={s.chipColor} strokeWidth={2} />
              </div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, fontWeight: 400, background: s.trendBg, color: s.trendColor }}>
                {s.trendLabel}
              </span>
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 28, color: '#0d253d', lineHeight: 1 }}>
              {loading ? '—' : s.value}
            </div>
            <div style={{ fontSize: 11, color: '#64748d', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e3e8ee', padding: 16, marginBottom: 14 }}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: '#0d253d' }}>Upcoming Deadlines</span>
          <span onClick={() => navigate('/tasks')} style={{ fontSize: 11, color: '#533afd', cursor: 'pointer' }}>See all →</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#a8c3de', fontSize: 12 }}>Loading...</div>
        ) : upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#a8c3de', fontSize: 12 }}>No upcoming deadlines.</div>
        ) : upcoming.map((d, i) => {
          const s = urgencyStyle[d.urgency]
          return (
            <div key={d.title} style={{ padding: '10px 4px', borderBottom: i < upcoming.length - 1 ? '1px solid #f6f9fc' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 400, color: s.text, flex: 1 }}>{d.title}</span>
              <span style={{ fontSize: 11, color: s.text }}>{d.date}</span>
            </div>
          )
        })}
      </div>

      {/* Recent Tasks */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e3e8ee', padding: 16 }}>
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: '#0d253d' }}>Recent Tasks</span>
          <span onClick={() => navigate('/tasks')} style={{ fontSize: 11, color: '#533afd', cursor: 'pointer' }}>View board →</span>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#a8c3de', fontSize: 12 }}>Loading...</div>
        ) : recentTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: '#a8c3de', fontSize: 12 }}>No tasks yet. Create one from the Task Board.</div>
        ) : recentTasks.map(t => {
          const ns = normalizeStatus(t.status)
          const assignedName = getUserName(t.assigned_user_id)
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f6f9fc', cursor: 'pointer' }} onClick={() => navigate(`/tasks/${t.id}`)}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: statusDot[ns], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#0d253d', fontWeight: 400, flex: 1 }}>{t.title}</span>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: assignedName ? avc(assignedName) : '#cbd5df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 500, color: '#fff', flexShrink: 0 }}>
                {assignedName ? ini(assignedName) : '?'}
              </div>
              <span style={{ fontSize: 11, color: '#a8c3de' }}>{fmtShort(t.due_date)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}