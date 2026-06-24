import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(s => {
          const isCompleted = s.label === 'Completed';
          const isTeam = s.label === 'Team Members';

          return (
            <div
              key={s.label}
              className="group border border-white/80 rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(83,58,253,0.12)] hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)', backdropFilter: 'blur(12px)' }}
            >
              <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" style={{ background: s.chipColor }}></div>
              <div className="relative z-10 flex items-center justify-between mb-3">
                <div style={{ width: 38, height: 38, borderRadius: 12, background: s.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.Icon size={18} color={s.chipColor} strokeWidth={2} />
                </div>
                {!isCompleted && !isTeam && (
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 9999, fontWeight: 500, background: s.trendBg, color: s.trendColor }}>
                    {s.trendLabel}
                  </span>
                )}
                {isCompleted && (
                  <div style={{ position: 'relative', width: 40, height: 40 }}>
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#e1f5ee" strokeWidth="4" />
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#0f6e56" strokeWidth="4" strokeDasharray="100.53" strokeDashoffset={100.53 - (100.53 * completedPct / 100)} strokeLinecap="round" transform="rotate(-90 20 20)" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#0f6e56]">
                      {completedPct}%
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 32, color: '#0d253d', lineHeight: 1 }}>
                    {loading ? '—' : s.value}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748d', marginTop: 6, fontWeight: 500 }}>
                    {s.label}
                  </div>
                </div>

                {isTeam && (
                  <div className="flex -space-x-2">
                    {users.filter(u => u.is_active).slice(0, 3).map((u, i) => (
                      <div key={u.id} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm" style={{ backgroundColor: ['#533afd', '#ea2261', '#c4922f', '#0f6e56'][i % 4], zIndex: 3 - i }}>
                        {ini(u.name)}
                      </div>
                    ))}
                    {activeUsers > 3 && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-[#533afd] bg-[#eeedfe] border-2 border-white shadow-sm" style={{ zIndex: 0 }}>
                        +{activeUsers - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Left Column: Timeline OR Selected Day Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: '#0d253d' }}>
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
                    <div key={t.id} className="p-4 rounded-xl border border-white bg-white/60 hover:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#d9d6fe] hover:shadow-[0_6px_20px_rgba(83,58,253,0.08)] transition-all cursor-pointer flex flex-col gap-3" onClick={() => navigate(`/tasks/${t.id}`)}>
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-[14px] font-semibold text-[#0d253d] leading-snug">{t.title}</span>
                        <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shrink-0" style={{ backgroundColor: '#f0efff', color: '#533afd' }}>{t.status || 'To do'}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                          {assignedName ? (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm" style={{ backgroundColor: '#533afd' }}>{ini(assignedName)}</div>
                          ) : (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-[#64748d] bg-[#f6f9fc] border border-[#e3e8ee]">?</div>
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
            <div className="relative pl-3 flex-1 overflow-y-auto pr-1" style={{ maxHeight: '360px' }}>
              {/* Vertical connecting line */}
              <div className="absolute left-3.5 top-2 bottom-4 w-px bg-[#e3e8ee]"></div>
              
              <div className="flex flex-col gap-4 relative">
                {upcoming.map(d => {
                  const s = urgencyStyle[d.urgency]
                  return (
                    <div key={d.title} className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/tasks')}>
                      {/* Timeline dot */}
                      <div className="w-2 h-2 rounded-full ring-4 ring-white relative z-10" style={{ backgroundColor: s.dot, boxShadow: `0 0 0 1px ${s.dot}40` }}></div>
                      
                      {/* Task Card */}
                      <div className="flex-1 flex items-center justify-between p-3.5 rounded-xl border border-white bg-white/40 hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all overflow-hidden relative">
                        {/* Urgency Edge Bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: s.dot }}></div>
                        
                        <span className="text-[13px] font-semibold text-[#0d253d] group-hover:text-[#533afd] transition-colors ml-2 truncate">{d.title}</span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md ml-2 shrink-0" style={{ color: s.text, backgroundColor: `${s.dot}15` }}>{d.date}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Task Calendar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: '#0d253d' }}>Task Calendar</span>
            <div className="flex items-center gap-1 bg-[#f6f9fc] p-1 rounded-lg border border-[#e3e8ee]">
              <button onClick={() => setCurrentDate(addDays(currentDate, -30))} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white hover:shadow-sm text-[#64748d] hover:text-[#533afd] transition-all">
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="text-[13px] font-bold text-[#0d253d] min-w-[90px] text-center tracking-wide">
                {format(currentDate, 'MMM yyyy')}
              </span>
              <button onClick={() => setCurrentDate(addDays(currentDate, 30))} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white hover:shadow-sm text-[#64748d] hover:text-[#533afd] transition-all">
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-7 mb-3">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[11px] font-bold text-[#a8c3de] uppercase tracking-wider">{day}</div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
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
                    
                    const dayTasks = tasks.filter(t => t.due_date && isSameDay(new Date(t.due_date), cloneDay))
                    const hasTask = dayTasks.length > 0
                    
                    days.push(
                      <div
                        key={cloneDay.toISOString()}
                        onClick={() => setSelectedDate(cloneDay)}
                        className={`flex flex-col items-center justify-center relative cursor-pointer rounded-xl transition-all duration-300 hover:bg-[#f0efff] ${!isCurrentMonth ? "text-[#cbd5df]" : isSelected ? "text-white font-bold" : isToday ? "text-[#533afd] font-bold" : "text-[#0d253d] font-medium"}`}
                        style={{ height: 46 }}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#665efd] to-[#533afd] -z-10 shadow-[0_4px_12px_rgba(83,58,253,0.3)]"></div>
                        )}
                        {!isSelected && isToday && (
                          <div className="absolute inset-1 rounded-xl bg-[#f0efff] -z-10 border border-[#d9d6fe]"></div>
                        )}
                        <span className="text-[14px] z-10">{format(cloneDay, 'd')}</span>
                        <div className="h-1.5 flex items-center justify-center mt-1">
                          {hasTask && (
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? '#ffffff' : '#ea2261', boxShadow: isSelected ? '0 0 6px rgba(255,255,255,0.8)' : '0 0 6px rgba(234,34,97,0.4)' }}></span>
                          )}
                        </div>
                      </div>
                    )
                    day = addDays(day, 1)
                  }
                  rows.push(
                    <div className="grid grid-cols-7 gap-1.5" key={day.toISOString()}>
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
      </div>
    </div>
  )
}