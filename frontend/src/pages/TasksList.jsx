import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { ClipboardList, Zap, CheckCircle2, X, MessageSquare } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const ini = (n) => n?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'
const avc = () => '#533afd'
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
const isLate = (d, s) => d && s !== 'completed' && new Date(d) < new Date()
const slabel = (s) => s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Completed'
const spill = (s) => s === 'todo' ? { bg: '#fdf6e8', color: '#9b6829' } : s === 'in_progress' ? { bg: '#eeedfe', color: '#534ab7' } : { bg: '#e1f5ee', color: '#0f6e56' }
const strip = (s) => s === 'todo' ? '#f0b97a' : s === 'in_progress' ? '#665efd' : '#5dcaa5'
const pdot = (p) => p === 'high' ? '#ea2261' : p === 'medium' ? '#9b6829' : '#0f6e56'
const statusBorder = (s) => s === 'todo' ? '#f0b97a' : s === 'in_progress' ? '#665efd' : '#5dcaa5'
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



  async function fetchTasks() {
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

  async function fetchUsers() {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (e) { console.error(e) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [])

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
    } catch (e) { console.error(e) }
  }

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${id}`)
      setTasks(tasks.filter(t => t.id !== id))
      setActiveId(null)
    } catch (e) { console.error(e) }
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

  const visibleTasks = isCollaborator
    ? tasks.filter(t => t.assigned_user_id === user?.id)
    : tasks

  const filtered = visibleTasks.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) &&
    (priority ? t.priority?.toLowerCase() === priority.toLowerCase() : true)
  )

  const cols = ['todo', 'in_progress', 'completed']
  const colStyle = {
    todo: { bg: '#fdf6e8', border: '#f0dcb0', nameColor: '#9b6829', cntBg: '#f5e9d4', emptyBorder: '#f0dcb0' },
    in_progress: { bg: '#f5f4fe', border: '#dcd9fb', nameColor: '#534ab7', cntBg: '#eeedfe', emptyBorder: '#dcd9fb' },
    completed: { bg: '#eaf8f1', border: '#bfe4d6', nameColor: '#0f6e56', cntBg: '#e1f5ee', emptyBorder: '#bfe4d6' },
  }
  const colLabel = { todo: 'TO DO', in_progress: 'IN PROGRESS', completed: 'COMPLETED' }

  const activeTask = visibleTasks.find(t => t.id === activeId)

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', height: '100vh', padding: 18, gap: 12, background: '#f6f9fc', overflow: 'hidden' }}>

      <style>{`
        @keyframes taskPop {
          0% { opacity: 0; transform: scale(0.92) translateY(6px); }
          60% { opacity: 1; transform: scale(1.02) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Topbar */}
      <PageHeader
        title="Task Board"
        subtitle={isCollaborator ? 'Showing tasks assigned to you' : 'Manage your team\'s tasks and progress'}
        statText={loading ? 'Loading tasks...' : `Total: ${filtered.length} task${filtered.length !== 1 ? 's' : ''} found`}
        statColor="#533afd"
      />
      <div className="flex items-center justify-end flex-shrink-0 mb-1 mt-1">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={{ background: '#fff', border: '1px solid #e3e8e', borderColor: '#e3e8ee', borderRadius: 6, padding: '7px 11px', fontSize: 11, color: '#0d253d', outline: 'none', width: 140, fontFamily: "'Inter', sans-serif" }}
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{ background: '#fff', border: '1px solid #e3e8ee', borderRadius: 6, padding: '7px 10px', fontSize: 11, color: '#64748d', fontFamily: "'Inter', sans-serif" }}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              style={{ background: '#533afd', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 9999, fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
            >
              + New Task
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, flexShrink: 0 }}>
        {[
          { label: 'To Do', Icon: ClipboardList, chipBg: '#fdf6e8', chipColor: '#9b6829', count: visibleTasks.filter(t => normalizeStatus(t.status) === 'todo').length },
          { label: 'In Progress', Icon: Zap, chipBg: '#eeedfe', chipColor: '#534ab7', count: visibleTasks.filter(t => normalizeStatus(t.status) === 'in_progress').length },
          { label: 'Completed', Icon: CheckCircle2, chipBg: '#e1f5ee', chipColor: '#0f6e56', count: visibleTasks.filter(t => normalizeStatus(t.status) === 'completed').length },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '11px 14px', border: '1px solid #e3e8ee', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: s.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.Icon size={15} color={s.chipColor} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 18, color: '#0d253d', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 10, color: '#64748d', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
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
              <div key={status} style={{ background: cs.bg, border: `1px solid ${cs.border}`, borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11, letterSpacing: '0.3px', color: cs.nameColor }}>{colLabel[status]}</span>
                  <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 9999, fontWeight: 400, background: cs.cntBg, color: cs.nameColor }}>{colTasks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, overflowY: 'auto', flex: 1 }}>
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: 16, fontSize: 10, color: '#a8c3de' }}>Loading...</div>
                  ) : colTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 16, fontSize: 10, color: '#a8c3de', border: `1px dashed ${cs.emptyBorder}`, borderRadius: 8 }}>
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
                          background: '#fff', borderRadius: 8, padding: '10px 12px 10px 10px', cursor: 'pointer',
                          borderTop: '1px solid #e3e8ee',
                          borderRight: '1px solid #e3e8ee',
                          borderBottom: '1px solid #e3e8ee',
                          borderLeft: activeId === t.id ? `3px solid #533afd` : `3px solid ${statusBorder(ns)}`,
                          transition: 'border-color 0.15s',
                          animation: isNew ? 'taskPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 400, color: ns === 'completed' ? '#64748d' : '#0d253d', lineHeight: 1.45, textDecoration: ns === 'completed' ? 'line-through' : 'none' }}>
                          {t.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: assignedName ? avc() : '#cbd5df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 500, color: '#fff' }}>
                            {assignedName ? ini(assignedName) : '?'}
                          </div>
                          <span style={{ fontSize: 9, color: isLate(t.due_date, ns) ? '#ea2261' : '#a8c3de' }}>{fmt(t.due_date)}</span>
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
              <div style={{ width: 285, height: '100%', background: '#fff', borderRadius: 12, border: '1px solid #e3e8ee', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: 4, background: strip(ns), flexShrink: 0 }} />
                <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => setActiveId(null)} style={{ background: '#f6f9fc', border: 'none', width: 22, height: 22, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} color="#64748d" />
                    </button>
                  </div>

                  <div style={{ background: spill(ns).bg, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 8, color: '#a8c3de', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>Task Details</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: '#0d253d', lineHeight: 1.4 }}>{activeTask.title}</div>
                  </div>

                  <div style={{ height: 1, background: '#f6f9fc' }} />

                  <div>
                    <div style={{ fontSize: 8, color: '#a8c3de', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Details</div>
                    {[
                      { key: 'Status', val: <span style={{ fontSize: 8, padding: '2px 8px', borderRadius: 9999, fontWeight: 400, background: spill(ns).bg, color: spill(ns).color }}>{slabel(ns)}</span> },
                      { key: 'Priority', val: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: pdot(activeTask.priority?.toLowerCase()), display: 'inline-block' }} /><span style={{ fontSize: 9, color: '#0d253d', fontWeight: 400, textTransform: 'capitalize' }}>{activeTask.priority}</span></span> },
                      { key: 'Assigned', val: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 16, height: 16, borderRadius: '50%', background: assignedName ? avc() : '#cbd5df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 500, color: '#fff' }}>{assignedName ? ini(assignedName) : '?'}</span><span style={{ fontSize: 9, color: '#0d253d', fontWeight: 400 }}>{assignedName || '—'}</span></span> },
                      { key: 'Due Date', val: <span style={{ fontSize: 9, color: isLate(activeTask.due_date, ns) ? '#ea2261' : '#0d253d', fontWeight: 400 }}>{fmt(activeTask.due_date)}</span> },
                    ].map(r => (
                      <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 9, color: '#64748d' }}>{r.key}</span>
                        {r.val}
                      </div>
                    ))}
                  </div>

                  <div style={{ height: 1, background: '#f6f9fc' }} />

                  {activeTask.description && (
                    <>
                      <div>
                        <div style={{ fontSize: 8, color: '#a8c3de', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>Description</div>
                        <div style={{ fontSize: 9, color: '#64748d', lineHeight: 1.6, background: '#f6f9fc', borderRadius: 7, padding: '8px 10px' }}>{activeTask.description}</div>
                      </div>
                      <div style={{ height: 1, background: '#f6f9fc' }} />
                    </>
                  )}

                  <div>
                    <div style={{ fontSize: 8, color: '#a8c3de', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>Actions</div>

                    <button onClick={() => navigate(`/tasks/${activeTask.id}`)}
                      style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #e3e8ee', background: '#fff', color: '#533afd', marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <MessageSquare size={11} /> Comments & Attachments
                    </button>

                    {ns !== 'todo' && <button onClick={() => moveTask(activeTask.id, 'To Do')} style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #f0dcb0', background: '#fdf6e8', color: '#9b6829', marginBottom: 5 }}>Move to To Do</button>}
                    {ns !== 'in_progress' && <button onClick={() => moveTask(activeTask.id, 'In Progress')} style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #dcd9fb', background: '#f5f4fe', color: '#534ab7', marginBottom: 5 }}>Move to In Progress</button>}
                    {ns !== 'completed' && <button onClick={() => moveTask(activeTask.id, 'Done')} style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #bfe4d6', background: '#eaf8f1', color: '#0f6e56', marginBottom: 5 }}>Mark as Completed</button>}
                    {canCreate && <button onClick={() => deleteTask(activeTask.id)} style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #f7d4d0', background: '#fdecea', color: '#ea2261' }}>Delete Task</button>}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Create Task Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,37,61,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: 440, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: '#0d253d' }}>New Task</span>
              <button onClick={() => setShowCreate(false)} style={{ background: '#f6f9fc', border: 'none', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} color="#64748d" />
              </button>
            </div>
            {error && <div style={{ marginBottom: 16, padding: '8px 12px', background: '#fdecea', border: '1px solid #f7d4d0', borderRadius: 8, fontSize: 12, color: '#ea2261' }}>{error}</div>}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Title *', key: 'title', type: 'text', placeholder: 'Task title' },
                { label: 'Description', key: 'description', type: 'textarea', placeholder: 'Optional description' },
                { label: 'Due Date', key: 'due_date', type: 'date', placeholder: '' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: '#64748d', marginBottom: 5 }}>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} rows={3} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e3e8ee', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none', resize: 'none' }} />
                  ) : (
                    <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e3e8ee', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none' }} />
                  )}
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: '#64748d', marginBottom: 5 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e3e8ee', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none' }}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: '#64748d', marginBottom: 5 }}>Assign To</label>
                  <select value={form.assigned_user_id} onChange={e => setForm({ ...form, assigned_user_id: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e3e8ee', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none' }}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{roleLabel(u.role)} — {u.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', borderRadius: 9999, border: '1px solid #e3e8ee', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: '#0d253d' }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: '8px 16px', borderRadius: 9999, border: 'none', background: '#533afd', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400, opacity: creating ? 0.6 : 1 }}>
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