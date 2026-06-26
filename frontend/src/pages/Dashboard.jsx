import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { ClipboardList, Zap, CheckCircle2, Users, Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay } from 'date-fns'
import PageHeader from '../components/PageHeader'

const ini = (name) => name?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'
const normalizeStatus = (s) => {
  if (!s) return 'todo'
  const map = { 'to do': 'todo', 'in progress': 'in_progress', 'done': 'completed', 'todo': 'todo', 'in_progress': 'in_progress', 'completed': 'completed' }
  return map[s.toLowerCase()] || 'todo'
}
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { user } = useAuth()
  const { notifications } = useSocket()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/tasks').catch(() => ({ data: [] })),
        api.get('/users?exclude_role=Admin').catch(() => ({ data: [] })),
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



  const todoCount = tasks.filter(t => normalizeStatus(t.status) === 'todo').length
  const inProgressCount = tasks.filter(t => normalizeStatus(t.status) === 'in_progress').length
  const completedCount = tasks.filter(t => normalizeStatus(t.status) === 'completed').length
  const totalTasks = tasks.length
  const completedPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0
  const activeUsers = users.filter(u => u.is_active).length

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0

  const today = new Date()
  const dueTodayCount = tasks.filter(t => t.due_date && normalizeStatus(t.status) !== 'completed' && isSameDay(new Date(t.due_date), today)).length

  const stats = [
    { Icon: ClipboardList, label: 'Total Tasks', value: totalTasks, bg: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)', shadow: 'rgba(168, 85, 247, 0.3)', pct: 100 },
    { Icon: Zap, label: 'In Progress', value: inProgressCount, bg: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', shadow: 'rgba(59, 130, 246, 0.3)', pct: totalTasks ? Math.round((inProgressCount / totalTasks) * 100) : 0 },
    { Icon: CheckCircle2, label: 'Completed', value: completedCount, bg: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)', shadow: 'rgba(244, 63, 94, 0.3)', pct: completedPct },
    { Icon: Users, label: 'Team Members', value: activeUsers, bg: 'linear-gradient(135deg, #06b6d4 0%, #2dd4bf 100%)', shadow: 'rgba(6, 182, 212, 0.3)', pct: users.length ? Math.round((activeUsers / users.length) * 100) : 0 },
  ]



  const now = new Date()
  const upcoming = tasks
    .filter(t => t.due_date && normalizeStatus(t.status) !== 'completed')
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 5)
    .map(t => {
      const due = new Date(t.due_date)
      const diffDays = Math.ceil((due - now) / 86400000)
      const urgency = diffDays < 0 ? 'urgent' : diffDays <= 1 ? 'soon' : 'ok'
      const dateLabel = diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : fmtShort(t.due_date)
      return { title: t.title, date: dateLabel, urgency }
    })

  const urgencyStyle = {
    urgent: { dot: '#ea2261', text: '#ea2261' }, // Red (Overdue)
    soon: { dot: '#533afd', text: '#533afd' }, // Primary Blue (Today/Tomorrow)
    ok: { dot: '#0f6e56', text: '#0f6e56' }, // Green (Future)
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="p-4 md:p-6 min-h-screen bg-[var(--bg)]">

      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`}
        subtitle="Here's what's happening with your projects today."
        statText={`You have ${dueTodayCount} tasks due today`}
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map((s) => {
          return (
            <div
              key={s.label}
              className="group rounded-xl p-5 shadow-lg hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden text-white"
              style={{ background: s.bg, boxShadow: `0 10px 20px -5px ${s.shadow}` }}
            >
              {/* Large faded icon in the background (Right) */}
              <div className="absolute -right-4 -top-2 opacity-[0.15] group-hover:opacity-25 transition-all duration-500 pointer-events-none transform group-hover:scale-110">
                <s.Icon size={100} strokeWidth={1.5} />
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9, marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 32, lineHeight: 1 }}>
                    {loading ? '—' : s.value}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-end mb-1">
                    <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-card)]/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--bg-card)] text-[var(--text)] rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        
        {/* Left Column: Timeline OR Selected Day Details */}
        <div className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-2xl border border-[var(--border)]/80 p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>
              {selectedDate ? `Tasks for ${format(selectedDate, 'MMM d, yyyy')}` : 'Upcoming Deadlines'}
            </span>
            <div className="flex items-center gap-3">
              {selectedDate && (
                <span onClick={() => setSelectedDate(null)} className="text-xs text-[#64748d] cursor-pointer hover:text-[#ea2261] font-medium transition-colors">Clear selection</span>
              )}
              <span onClick={() => navigate('/tasks')} className="text-xs text-[#533afd] cursor-pointer hover:underline font-medium">See all →</span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10 text-[#a8c3de] text-sm flex-1">Loading...</div>
          ) : selectedDate ? (
            /* Selected Date View */
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1" style={{ maxHeight: '360px' }}>
              {(() => {
                const dayTasks = tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), selectedDate))
                if (dayTasks.length === 0) {
                  return (
                    <div className="text-center flex-1 flex flex-col items-center justify-center text-[#a8c3de]">
                      <CheckCircle2 size={36} className="mb-3 opacity-40 text-[#533afd]" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-[#64748d]">No tasks due on this day!</span>
                      <span className="text-xs mt-1">Enjoy your free time.</span>
                    </div>
                  )
                }
                return dayTasks.map(t => {
                  const assignedName = users.find(u => u.id === t.assigned_user_id)?.name
                  return (
                    <div key={t.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/60 hover:bg-[var(--bg-card)] text-[var(--text)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#d9d6fe] hover:shadow-[0_6px_20px_rgba(83,58,253,0.08)] transition-all cursor-pointer flex flex-col gap-3" onClick={() => navigate(`/tasks/${t.id}`)}>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[14px] font-semibold text-[#0d253d] leading-snug">{t.title}</span>
                        <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shrink-0" style={{ backgroundColor: '#f0efff', color: 'var(--primary)' }}>{t.status || 'To do'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                          {assignedName ? (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style={{ backgroundColor: '#533afd' }}>{ini(assignedName)}</div>
                          ) : (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-[#64748d] bg-[var(--bg)] border border-[#e3e8ee]">?</div>
                          )}
                          <span className="text-xs font-medium text-[#64748d]">{assignedName || 'Unassigned'}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-[#fff4f4] text-[#d92d20] capitalize">{t.priority || 'Medium'} priority</span>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-10 text-[#a8c3de] text-sm flex-1">No upcoming deadlines.</div>
          ) : (
            /* Default Timeline View */
            <div className="relative pl-8 flex-1 overflow-y-auto pr-1" style={{ maxHeight: '360px' }}>
              {/* Vertical connecting line */}
              <div className="absolute left-[15px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-[#ea2261] via-[#c4922f] to-[#0f6e56] opacity-20 rounded-full"></div>
              
              <div className="flex flex-col gap-4 relative">
                {upcoming.map(d => {
                  const s = urgencyStyle[d.urgency]
                  return (
                    <div key={d.title} className="flex items-center group cursor-pointer relative" onClick={() => navigate('/tasks')}>
                      {/* Timeline dot */}
                      <div className="absolute -left-[20px] w-3 h-3 rounded-full bg-[var(--bg-card)] text-[var(--text)] border-[3px] z-10 transition-transform group-hover:scale-125" style={{ borderColor: s.dot, boxShadow: `0 0 0 4px var(--bg)` }}></div>
                      
                      {/* Task Card */}
                      <div className="flex-1 flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/60 hover:bg-[var(--bg-card)] text-[var(--text)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(83,58,253,0.08)] hover:border-[#d9d6fe] transition-all overflow-hidden relative">
                        <span className="text-[14px] font-semibold text-[#0d253d] group-hover:text-[#533afd] transition-colors truncate">{d.title}</span>
                        <span className="text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0" style={{ color: s.text, backgroundColor: `${s.dot}15` }}>{d.date}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Task Calendar */}
          <div className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-2xl border border-[var(--border)]/80 p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col h-fit">
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>Task Calendar</span>
            <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-lg border border-[#e3e8ee]">
              <button onClick={() => setCurrentDate(addDays(currentDate, -30))} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--bg-card)] text-[var(--text)] hover:shadow-sm text-[#64748d] hover:text-[#533afd] transition-all">
                <ChevronLeft size={14} strokeWidth={2.5} />
              </button>
              <span className="text-[12px] font-bold text-[#0d253d] min-w-[80px] text-center tracking-wide">
                {format(currentDate, 'MMM yyyy')}
              </span>
              <button onClick={() => setCurrentDate(addDays(currentDate, 30))} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-[var(--bg-card)] text-[var(--text)] hover:shadow-sm text-[#64748d] hover:text-[#533afd] transition-all">
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-7 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-[#a8c3de] uppercase tracking-wider">{day}</div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {(() => {
                const monthStart = startOfMonth(currentDate)
                const monthEnd = endOfMonth(monthStart)
                const startDate = startOfWeek(monthStart)
                const endDate = endOfWeek(monthEnd)
                const rows = []
                let days = []
                let day = startDate
                
                while (day <= endDate) {
                  for (let i = 0; i < 7; i++) {
                    const cloneDay = day
                    const isCurrentMonth = isSameMonth(cloneDay, monthStart)
                    const isToday = isSameDay(cloneDay, new Date())
                    const isSelected = selectedDate && isSameDay(cloneDay, selectedDate)
                    
                    const dayTasks = tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), cloneDay) && normalizeStatus(t.status) !== 'completed')
                    const hasTask = dayTasks.length > 0
                    
                    let dotColor = '#0f6e56' // Default ok (Green)
                    let dotShadow = 'rgba(15,110,86,0.4)'
                    if (hasTask) {
                      const diffDays = Math.ceil((cloneDay - now) / 86400000)
                      if (diffDays < 0) {
                        dotColor = '#ea2261' // Red (urgent)
                        dotShadow = 'rgba(234,34,97,0.4)'
                      } else if (diffDays <= 1) {
                        dotColor = '#533afd' // Blue (soon)
                        dotShadow = 'rgba(83,58,253,0.4)'
                      }
                    }

                    days.push(
                      <div
                        key={cloneDay.toISOString()}
                        onClick={() => setSelectedDate(cloneDay)}
                        className={`flex flex-col items-center justify-center relative cursor-pointer rounded-xl transition-all duration-300 hover:bg-[#f0efff] ${!isCurrentMonth ? "text-[#cbd5df]" : isSelected ? "text-white font-bold" : isToday ? "text-[#533afd] font-bold" : "text-[#0d253d] font-medium"}`}
                        style={{ height: 36 }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#665efd] to-[#533afd] -z-10 shadow-[0_2px_8px_rgba(83,58,253,0.3)]"></div>
                        )}
                        {!isSelected && isToday && (
                          <div className="absolute inset-1 rounded-xl bg-[#f0efff] -z-10 border border-[#d9d6fe]"></div>
                        )}
                        <span className="text-[12px] z-10">{format(cloneDay, 'd')}</span>
                        <div className="h-1 flex items-center justify-center mt-0.5">
                          {hasTask && (
                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: isSelected ? '#ffffff' : dotColor, boxShadow: isSelected ? '0 0 4px rgba(255,255,255,0.8)' : `0 0 4px ${dotShadow}` }}></span>
                          )}
                        </div>
                      </div>
                    )
                    day = addDays(day, 1)
                  }
                  rows.push(
                    <div className="grid grid-cols-7 gap-1" key={day.toISOString()}>
                      {days}
                    </div>
                  )
                  days = []
                }
                return rows
              })()}
            </div>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-2xl border border-[var(--border)]/80 p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col h-fit">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: 'var(--text)', marginBottom: 16 }}>Progress Overview</span>
            
            <div className="flex items-end justify-between mb-2">
              <span className="text-[24px] font-bold text-[#0d253d] leading-none">{completedPct}%</span>
              <span className="text-[12px] font-medium text-[#64748d] mb-1">Completed</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#f0efff] rounded-full overflow-hidden mb-5">
              <div className="h-full bg-gradient-to-r from-[#533afd] to-[#8d82fe] rounded-full transition-all duration-1000" style={{ width: `${completedPct}%` }}></div>
            </div>

            {/* Stats Breakdown */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--border)] bg-[#ea2261] shadow-[0_0_0_1px_#ea2261]"></div>
                  <span className="text-[12px] font-medium text-[#64748d]">To Do</span>
                </div>
                <span className="text-[12px] font-bold text-[#0d253d]">{todoCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--border)] bg-[#c4922f] shadow-[0_0_0_1px_#c4922f]"></div>
                  <span className="text-[12px] font-medium text-[#64748d]">In Progress</span>
                </div>
                <span className="text-[12px] font-bold text-[#0d253d]">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--border)] bg-[#0f6e56] shadow-[0_0_0_1px_#0f6e56]"></div>
                  <span className="text-[12px] font-medium text-[#64748d]">Completed</span>
                </div>
                <span className="text-[12px] font-bold text-[#0d253d]">{completedCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}