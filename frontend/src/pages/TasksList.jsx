import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const ini = (n) => n?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'
const avc = (n) => ['#818cf8', '#34d399', '#60a5fa', '#f472b6', '#fb923c'][n?.charCodeAt(0) % 5] || '#818cf8'
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const isLate = (d, s) => d && s !== 'completed' && new Date(d) < new Date()
const slabel = (s) => s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Completed'
const spill = (s) => s === 'todo' ? { bg: '#fef9e7', color: '#d97706' } : s === 'in_progress' ? { bg: '#eff6ff', color: '#2563eb' } : { bg: '#ecfdf5', color: '#059669' }
const strip = (s) => s === 'todo' ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : s === 'in_progress' ? 'linear-gradient(90deg,#60a5fa,#3b82f6)' : 'linear-gradient(90deg,#34d399,#10b981)'
const pdot = (p) => p === 'high' ? '#dc2626' : p === 'medium' ? '#d97706' : '#059669'
const statusBorder = (s) => s === 'todo' ? '#f59e0b' : s === 'in_progress' ? '#3b82f6' : '#10b981'
const normalizeStatus = (s) => {
  if (!s) return 'todo'
  const map = { 'to do': 'todo', 'in progress': 'in_progress', 'done': 'completed', 'todo': 'todo', 'in_progress': 'in_progress', 'completed': 'completed' }
  return map[s.toLowerCase()] || 'todo'
}
const roleLabel = (r) => r === 'ProjectManager' ? 'Project Manager' : r

const EMPTY_MESSAGES = {
  todo: 'No tasks to do',
  in_progress: 'Nothing in progress',
  completed: 'No completed tasks yet',
}

export default function TasksList() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'todo', assigned_user_id: '', due_date: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [newlyCreatedId, setNewlyCreatedId] = useState(null)

  const canCreate = user?.role === 'Admin' || user?.role === 'ProjectManager'
  const isCollaborator = user?.role === 'Collaborator'

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await api.get('/tasks')
      setTasks(res.data)
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch { }
  }

  const getUser = (assigned_user_id) => {
    if (!assigned_user_id) return null
    return users.find(u => u.id === assigned_user_id) || null
  }

  const getUserName = (assigned_user_id) => {
    const u = getUser(assigned_user_id)
    return u ? u.name : null
  }

  const moveTask = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status })
      setTasks(tasks.map(t => t.id === id ? { ...t, status } : t))
      setActiveId(id)
    } catch { }
  }

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${id}`)
      setTasks(tasks.filter(t => t.id !== id))
      setActiveId(null)
    } catch { }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required.')
    try {
      setCreating(true)
      const payload = { ...form }
      if (!payload.assigned_user_id) delete payload.assigned_user_id
      const res = await api.post('/tasks', payload)
      setTasks([...tasks, res.data])
      setNewlyCreatedId(res.data.id)
      setTimeout(() => setNewlyCreatedId(null), 900)
      setShowCreate(false)
      setForm({ title: '', description: '', priority: 'Medium', status: 'todo', assigned_user_id: '', due_date: '' })
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.')
    } finally {
      setCreating(false)
    }
  }

  // Role-based visibility: Collaborators only see tasks assigned to them.
  // Admin and Project Manager see all tasks (per SRS: PM has "full task control").
  const visibleTasks = isCollaborator
    ? tasks.filter(t => t.assigned_user_id === user?.id)
    : tasks

  const filtered = visibleTasks.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) &&
    (priority ? t.priority?.toLowerCase() === priority.toLowerCase() : true)
  )

  const cols = ['todo', 'in_progress', 'completed']
  const colStyle = {
    todo: { bg: '#fef9e7', border: '#fde68a', nameColor: '#d97706', cntBg: '#fde68a', emptyBorder: '#fde68a' },
    in_progress: { bg: '#eff6ff', border: '#bfdbfe', nameColor: '#2563eb', cntBg: '#bfdbfe', emptyBorder: '#bfdbfe' },
    completed: { bg: '#ecfdf5', border: '#a7f3d0', nameColor: '#059669', cntBg: '#a7f3d0', emptyBorder: '#a7f3d0' },
  }
  const colLabel = { todo: 'TO DO', in_progress: 'IN PROGRESS', completed: 'COMPLETED' }

  const activeTask = visibleTasks.find(t => t.id === activeId)

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", display: 'flex', flexDirection: 'column', height: '100vh', padding: 18, gap: 12, background: '#f5f4f0', overflow: 'hidden' }}>

      <style>{`
        @keyframes taskPop {
          0% { opacity: 0; transform: scale(0.92) translateY(6px); }
          60% { opacity: 1; transform: scale(1.02) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes checkBounce {
          0% { transform: scale(0.6); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Topbar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 20, color: '#1a1a2e', letterSpacing: '-0.5px' }}>Task Board</h1>
          <p style={{ fontSize: 10, color: '#9090a0', marginTop: 2 }}>
            {isCollaborator ? 'Showing tasks assigned to you' : 'Click any task card to view full details'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={{ background: '#fff', border: '1.5px solid #e8e8f0', borderRadius: 7, padding: '6px 10px', fontSize: 10, color: '#1a1a2e', outline: 'none', width: 130, fontFamily: "'Instrument Sans', sans-serif" }}
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{ background: '#fff', border: '1.5px solid #e8e8f0', borderRadius: 7, padding: '6px 9px', fontSize: 10, color: '#6060a0', fontFamily: "'Instrument Sans', sans-serif" }}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              style={{ background: '#1a1a2e', color: '#fff', border: 'none', padding: '6px 13px', borderRadius: 7, fontSize: 10, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500 }}
            >
              + New Task
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flexShrink: 0 }}>
        {[
          { label: 'To Do', icon: '📋', bg: '#fef9e7', ibg: '#fef3c7', count: visibleTasks.filter(t => normalizeStatus(t.status) === 'todo').length },
          { label: 'In Progress', icon: '⚡', bg: '#eff6ff', ibg: '#dbeafe', count: visibleTasks.filter(t => normalizeStatus(t.status) === 'in_progress').length },
          { label: 'Completed', icon: '✅', bg: '#ecfdf5', ibg: '#d1fae5', count: visibleTasks.filter(t => normalizeStatus(t.status) === 'completed').length },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '11px 14px', border: '1.5px solid #e8e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: s.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 18, color: '#1a1a2e', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 9, color: '#9090a0', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban + Detail */}
      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
        {/* Kanban */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flex: activeId ? '0 0 calc(100% - 295px)' : 1, transition: 'flex 0.38s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden' }}>
          {cols.map(status => {
            const cs = colStyle[status]
            const colTasks = filtered.filter(t => normalizeStatus(t.status) === status)
            return (
              <div key={status} style={{ background: cs.bg, border: `1.5px solid ${cs.border}`, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: '0.5px', color: cs.nameColor }}>{colLabel[status]}</span>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 700, background: cs.cntBg, color: cs.nameColor }}>{colTasks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, overflowY: 'auto', flex: 1 }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: 16, fontSize: 10, color: '#c0c0c8' }}>Loading...</div>
                  ) : colTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 16, fontSize: 10, color: '#c0c0c8', border: `1.5px dashed ${cs.emptyBorder}`, borderRadius: 8 }}>
                      {EMPTY_MESSAGES[status]}
                    </div>
                  ) : colTasks.map(t => {
                    const assignedName = getUserName(t.assigned_user_id)
                    const ns = normalizeStatus(t.status)
                    const isNew = t.id === newlyCreatedId
                    return (
                      <div
                        key={t.id}
                        onClick={() => setActiveId(activeId === t.id ? null : t.id)}
                        style={{
                          background: '#fff', borderRadius: 9, padding: '11px 13px 11px 11px', cursor: 'pointer',
                          borderTop: '1.5px solid rgba(0,0,0,0.05)',
                          borderRight: '1.5px solid rgba(0,0,0,0.05)',
                          borderBottom: '1.5px solid rgba(0,0,0,0.05)',
                          borderLeft: activeId === t.id ? `3px solid #818cf8` : `3px solid ${statusBorder(ns)}`,
                          boxShadow: activeId === t.id ? '0 2px 12px rgba(129,140,248,0.2)' : 'none',
                          transition: 'box-shadow 0.15s, border-color 0.15s',
                          animation: isNew ? 'taskPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 500, color: ns === 'completed' ? '#9090a0' : '#1a1a2e', lineHeight: 1.45, textDecoration: ns === 'completed' ? 'line-through' : 'none' }}>
                          {t.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: assignedName ? avc(assignedName) : '#d0d0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff' }}>
                            {assignedName ? ini(assignedName) : '?'}
                          </div>
                          <span style={{ fontSize: 9, color: isLate(t.due_date, ns) ? '#dc2626' : '#b0b0c0' }}>{fmt(t.due_date)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail Panel */}
        {activeTask && (() => {
          const assignedName = getUserName(activeTask.assigned_user_id)
          const ns = normalizeStatus(activeTask.status)
          return (
            <div style={{ width: 285, flexShrink: 0, marginLeft: 10 }}>
              <div style={{ width: 285, height: '100%', background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: 4, background: strip(ns), flexShrink: 0 }} />
                <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => setActiveId(null)} style={{ background: '#f0f0f8', border: 'none', width: 22, height: 22, borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#9090a0' }}>✕</button>
                  </div>

                  <div style={{ background: spill(ns).bg, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 8, color: '#b0b0c0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Task Details</div>
                    <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 13, color: '#1a1a2e', lineHeight: 1.4, marginBottom: 6 }}>{activeTask.title}</div>
                    <span style={{ background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe', fontSize: 8, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>TASK</span>
                  </div>

                  <div style={{ height: 1, background: '#f0f0f8' }} />

                  <div>
                    <div style={{ fontSize: 8, color: '#b0b0c0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Details</div>
                    {[
                      { key: 'Status', val: <span style={{ fontSize: 8, padding: '2px 7px', borderRadius: 7, fontWeight: 700, background: spill(ns).bg, color: spill(ns).color }}>{slabel(ns)}</span> },
                      { key: 'Priority', val: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: pdot(activeTask.priority?.toLowerCase()), display: 'inline-block' }} /><span style={{ fontSize: 9, color: '#1a1a2e', fontWeight: 500, textTransform: 'capitalize' }}>{activeTask.priority}</span></span> },
                      { key: 'Assigned', val: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 16, height: 16, borderRadius: '50%', background: assignedName ? avc(assignedName) : '#d0d0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 700, color: '#fff' }}>{assignedName ? ini(assignedName) : '?'}</span><span style={{ fontSize: 9, color: '#1a1a2e', fontWeight: 500 }}>{assignedName || '—'}</span></span> },
                      { key: 'Due Date', val: <span style={{ fontSize: 9, color: isLate(activeTask.due_date, ns) ? '#dc2626' : '#1a1a2e', fontWeight: 500 }}>{fmt(activeTask.due_date)}</span> },
                    ].map(r => (
                      <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 9, color: '#9090a0' }}>{r.key}</span>
                        {r.val}
                      </div>
                    ))}
                  </div>

                  <div style={{ height: 1, background: '#f0f0f8' }} />

                  {activeTask.description && (
                    <>
                      <div>
                        <div style={{ fontSize: 8, color: '#b0b0c0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Description</div>
                        <div style={{ fontSize: 9, color: '#6060a0', lineHeight: 1.6, background: '#fafafa', borderRadius: 7, padding: '8px 10px', border: '1px solid #f0f0f8' }}>{activeTask.description}</div>
                      </div>
                      <div style={{ height: 1, background: '#f0f0f8' }} />
                    </>
                  )}

                  <div>
                    <div style={{ fontSize: 8, color: '#b0b0c0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Actions</div>

                    {/* View Full Details button */}
                    <button onClick={() => navigate(`/tasks/${activeTask.id}`)}
                      style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #ddd6fe', background: '#f5f3ff', color: '#7c3aed', marginBottom: 5 }}>
                      💬 Comments & Attachments →
                    </button>

                    {ns !== 'todo' && <button onClick={() => moveTask(activeTask.id, 'To Do')} style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #fde68a', background: '#fef9e7', color: '#d97706', marginBottom: 5 }}>Move to To Do</button>}
                    {ns !== 'in_progress' && <button onClick={() => moveTask(activeTask.id, 'In Progress')} style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', marginBottom: 5 }}>Move to In Progress</button>}
                    {ns !== 'completed' && <button onClick={() => moveTask(activeTask.id, 'Done')} style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #a7f3d0', background: '#ecfdf5', color: '#059669', marginBottom: 5 }}>Mark as Completed</button>}
                    {canCreate && <button onClick={() => deleteTask(activeTask.id)} style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #fecaca', background: '#fff5f5', color: '#dc2626' }}>Delete Task</button>}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Create Task Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: 440, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>New Task</span>
              <button onClick={() => setShowCreate(false)} style={{ background: '#f0f0f8', border: 'none', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#9090a0' }}>✕</button>
            </div>
            {error && <div style={{ marginBottom: 16, padding: '8px 12px', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#dc2626' }}>{error}</div>}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Title *', key: 'title', type: 'text', placeholder: 'Task title' },
                { label: 'Description', key: 'description', type: 'textarea', placeholder: 'Optional description' },
                { label: 'Due Date', key: 'due_date', type: 'date', placeholder: '' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6060a0', marginBottom: 5 }}>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} rows={3} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e8e8f0', fontSize: 12, fontFamily: "'Instrument Sans', sans-serif", outline: 'none', resize: 'none' }} />
                  ) : (
                    <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e8e8f0', fontSize: 12, fontFamily: "'Instrument Sans', sans-serif", outline: 'none' }} />
                  )}
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6060a0', marginBottom: 5 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e8e8f0', fontSize: 12, fontFamily: "'Instrument Sans', sans-serif", outline: 'none' }}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6060a0', marginBottom: 5 }}>Assign To</label>
                  <select value={form.assigned_user_id} onChange={e => setForm({ ...form, assigned_user_id: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e8e8f0', fontSize: 12, fontFamily: "'Instrument Sans', sans-serif", outline: 'none' }}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{roleLabel(u.role)} — {u.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e8e8f0', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif" }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#1a1a2e', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, opacity: creating ? 0.6 : 1 }}>
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}