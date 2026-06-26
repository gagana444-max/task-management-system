import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { ClipboardList, Zap, CheckCircle2, X, MessageSquare, LayoutGrid, List, ArrowDownUp, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import RichTextEditor from '../components/RichTextEditor'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'react-toastify'

// ---------- DnD sub-components (must be top-level for hooks) ----------
function DroppableColumn({ id, colBg, dragBg, border, children }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver ? dragBg : colBg,
        borderRadius: 16,
        border: `1.5px solid ${isOver ? border : 'rgba(255,255,255,0.9)'}`,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        overflowY: 'auto',
        boxShadow: isOver ? `0 0 0 2px ${border}40` : '0 4px 15px rgba(0,0,0,0.04)',
        transition: 'background 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {children}
    </div>
  )
}

function DraggableCard({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  )
}

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

export default function TasksList({ projectId = null, hideHeader = false, initialViewMode = 'board' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'todo', assigned_user_id: '', project_id: '', due_date: '' })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [newlyCreatedId, setNewlyCreatedId] = useState(null)
  
  const [viewMode, setViewMode] = useState(initialViewMode)
  const [sortBy, setSortBy] = useState('newest')
  const [draggingTask, setDraggingTask] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const canCreate = user?.role === 'Admin' || user?.role === 'ProjectManager'
  const isCollaborator = user?.role === 'Collaborator'



  async function fetchTasks() {
    try {
      setLoading(true)
      const res = await api.get(projectId ? `/tasks?project_id=${projectId}` : '/tasks')
      setTasks(res.data)
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const handleDnDEnd = async ({ active, over }) => {
    setDraggingTask(null)
    if (!over) return
    const taskId = parseInt(active.id)
    const newStatus = over.id
    const taskObj = tasks.find(t => t.id === taskId)
    if (!taskObj || normalizeStatus(taskObj.status) === newStatus) return

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    try {
      const statusMap = { 'todo': 'To Do', 'in_progress': 'In Progress', 'completed': 'Completed' }
      await api.patch(`/tasks/${taskId}/status`, { status: statusMap[newStatus] })
      toast.success(`Moved "${taskObj.title}" to ${statusMap[newStatus]}`)
    } catch {
      fetchTasks()
      toast.error('Failed to update task status')
    }
  }

  async function fetchUsers() {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (e) { console.error(e) }
  }

  async function fetchProjects() {
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
    } catch (e) { console.error(e) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTasks()
    fetchUsers()
    fetchProjects()
  }, [])

  const getUser = (assigned_user_id) => {
    if (!assigned_user_id) return null
    return users.find(u => u.id === assigned_user_id) || null
  }

  const getUserName = (assigned_user_id) => {
    const u = getUser(assigned_user_id)
    return u ? u.name : null
  }

  const getProjectName = (pid) => {
    if (!pid) return null
    return projects.find(p => p.id === pid)?.name || null
  }

  const moveTask = async (id, status) => {
    try {
      const taskObj = tasks.find(t => t.id === id)
      await api.patch(`/tasks/${id}/status`, { status })
      setTasks(tasks.map(t => t.id === id ? { ...t, status } : t))
      setActiveId(id)
      toast.success(`Moved "${taskObj?.title || 'task'}" to ${status}`)
    } catch (e) {
      console.error(e)
      toast.error('Failed to update task status')
    }
  }

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return
    try {
      const taskObj = tasks.find(t => t.id === id)
      await api.delete(`/tasks/${id}`)
      setTasks(tasks.filter(t => t.id !== id))
      setActiveId(null)
      toast.success(`Deleted task "${taskObj?.title || 'task'}"`)
    } catch (e) {
      console.error(e)
      toast.error('Failed to delete task')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.assigned_user_id) return setError('Assignee is required.')

    let targetProjectId = form.project_id
    if (projectId) {
      targetProjectId = projectId
    }
    if (!targetProjectId) return setError('Project is required.')

    try {
      setCreating(true)
      const payload = { 
        ...form,
        assigned_user_id: Number(form.assigned_user_id),
        project_id: Number(targetProjectId),
        due_date: form.due_date || null
      }
      
      const res = await api.post('/tasks', payload)
      setTasks([...tasks, res.data])
      setNewlyCreatedId(res.data.id)
      setTimeout(() => setNewlyCreatedId(null), 900)
      setShowCreate(false)
      setForm({ title: '', description: '', priority: 'Medium', status: 'todo', assigned_user_id: '', project_id: '', due_date: '' })
      setError('')
      toast.success(`Task "${res.data.title}" created successfully!`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.')
      toast.error(err.response?.data?.message || 'Failed to create task.')
    } finally {
      setCreating(false)
    }
  }

  const visibleTasks = isCollaborator
    ? tasks.filter(t => t.assigned_user_id === user?.id)
    : tasks

  let filtered = visibleTasks.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) &&
    (priority ? t.priority?.toLowerCase() === priority.toLowerCase() : true)
  )

  // Apply Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || b.id) - new Date(a.created_at || a.id)
    if (sortBy === 'due_asc') {
      if (!a.due_date) return 1; if (!b.due_date) return -1
      return new Date(a.due_date) - new Date(b.due_date)
    }
    if (sortBy === 'due_desc') {
      if (!a.due_date) return 1; if (!b.due_date) return -1
      return new Date(b.due_date) - new Date(a.due_date)
    }
    if (sortBy === 'priority') {
      const pmap = { high: 3, medium: 2, low: 1 }
      const pa = pmap[a.priority?.toLowerCase()] || 0
      const pb = pmap[b.priority?.toLowerCase()] || 0
      return pb - pa
    }
    return 0
  })

  const cols = ['todo', 'in_progress', 'completed']
  const colStyle = {
    todo:        { bg: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)', border: '#fde047', nameColor: '#ca8a04', emptyBorder: '#fde047', colBg: '#fdf8e1', dragBg: '#fef3c0' },
    in_progress: { bg: 'linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%)', border: '#86efac', nameColor: '#16a34a', emptyBorder: '#86efac', colBg: '#f0fdf4', dragBg: '#dcfce7' },
    completed:   { bg: 'linear-gradient(135deg, #e0eaff 0%, #c7d2fe 100%)', border: '#a5b4fc', nameColor: '#4f46e5', emptyBorder: '#a5b4fc', colBg: '#eef2ff', dragBg: '#e0e7ff' },
  }
  const colLabel = { todo: 'TO DO', in_progress: 'IN PROGRESS', completed: 'COMPLETED' }

  const activeTask = visibleTasks.find(t => t.id === activeId)

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', height: '100vh', padding: 18, gap: 12, background: 'var(--bg)', overflow: 'hidden' }}>

      <style>{`
        @keyframes taskPop {
          0% { opacity: 0; transform: scale(0.92) translateY(6px); }
          60% { opacity: 1; transform: scale(1.02) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {/* Topbar */}
      {!hideHeader && (
        <PageHeader
          title="Task Board"
          subtitle={isCollaborator ? 'Showing tasks assigned to you' : 'Manage your team\'s tasks and progress'}
          statText={loading ? 'Loading tasks...' : `Total: ${filtered.length} task${filtered.length !== 1 ? 's' : ''} found`}
          statColor="#533afd"
        />
      )}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between flex-shrink-0 mb-3 mt-1 gap-3">
        {/* View Toggle */}
        {!hideHeader && (
          <div className="flex items-center bg-[#fff] border border-[#e3e8ee] rounded-lg p-1 shadow-sm w-fit">
            <button onClick={() => setViewMode('board')} className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'board' ? 'bg-[#533afd] text-white' : 'text-[#64748d] hover:bg-[var(--bg)]'}`}>
              <LayoutGrid size={16} />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'table' ? 'bg-[#533afd] text-white' : 'text-[#64748d] hover:bg-[var(--bg)]'}`}>
              <List size={16} />
            </button>
          </div>
        )}
        
        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            style={{ background: 'var(--bg-card)', border: '1px solid #e3e8e', borderColor: '#e3e8ee', borderRadius: 6, padding: '7px 11px', fontSize: 11, color: 'var(--text)', outline: 'none', width: 140, fontFamily: "'Inter', sans-serif" }}
          />
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <div className="flex items-center gap-1.5 ml-1 border-l border-[#e3e8ee] pl-3">
            <ArrowDownUp size={14} color="#64748d" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
            >
              <option value="newest">Newest First</option>
              <option value="due_asc">Due Date (Closest)</option>
              <option value="due_desc">Due Date (Furthest)</option>
              <option value="priority">Priority (High-Low)</option>
            </select>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 9999, fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400, marginLeft: 8 }}
            >
              + New Task
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 shrink-0">
        {[
          { label: 'To Do', Icon: ClipboardList, chipBg: '#fdf6e8', chipColor: '#9b6829', count: visibleTasks.filter(t => normalizeStatus(t.status) === 'todo').length },
          { label: 'In Progress', Icon: Zap, chipBg: '#eeedfe', chipColor: '#534ab7', count: visibleTasks.filter(t => normalizeStatus(t.status) === 'in_progress').length },
          { label: 'Completed', Icon: CheckCircle2, chipBg: '#e1f5ee', chipColor: '#0f6e56', count: visibleTasks.filter(t => normalizeStatus(t.status) === 'completed').length },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '11px 14px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: s.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.Icon size={15} color={s.chipColor} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 18, color: 'var(--text)', lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Board/Table + Detail */}
      <div style={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
        
        {viewMode === 'board' ? (
          /* Kanban Board — @dnd-kit/core (no position:fixed offset issues) */
          <DndContext
            sensors={sensors}
            onDragStart={({ active }) => setDraggingTask(filtered.find(t => t.id.toString() === active.id) || null)}
            onDragEnd={handleDnDEnd}
          >
            <div 
              className="flex md:grid md:grid-cols-3 gap-2.5 overflow-x-auto pb-2 snap-x"
              style={{ flex: activeId ? '0 0 calc(100% - 295px)' : 1, transition: 'flex 0.38s cubic-bezier(0.4,0,0.2,1)' }}
            >
              {cols.map(status => {
                const cs = colStyle[status]
                const colTasks = filtered.filter(t => normalizeStatus(t.status) === status)
                return (
                  <div key={status} className="min-w-[280px] md:min-w-0 snap-center flex flex-col">
                    <DroppableColumn id={status} colBg={cs.colBg} dragBg={cs.dragBg} border={cs.border}>
                    {/* Column header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7, flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11, padding: '5px 12px', borderRadius: 9999, background: cs.bg, color: cs.nameColor, boxShadow: `0 2px 6px ${cs.border}` }}>{colLabel[status]}</span>
                      <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 9999, fontWeight: 600, background: 'rgba(255,255,255,0.8)', color: 'var(--text)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>{colTasks.length}</span>
                    </div>

                    {/* Cards */}
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: 16, fontSize: 10, color: 'var(--border-input)' }}>Loading...</div>
                    ) : colTasks.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 16, fontSize: 10, color: 'var(--border-input)', border: `1px dashed ${cs.emptyBorder}`, borderRadius: 8 }}>
                        {EMPTY_MESSAGES[status]}
                      </div>
                    ) : colTasks.map(t => {
                      const assignedName = getUserName(t.assigned_user_id)
                      const ns = normalizeStatus(t.status)
                      const isNew = t.id === newlyCreatedId
                      return (
                        <DraggableCard key={t.id} id={t.id.toString()}>
                          <div
                            onClick={() => setActiveId(activeId === t.id ? null : t.id)}
                            style={{
                              background: '#fff', borderRadius: 12, padding: '14px',
                              border: activeId === t.id ? `2px solid var(--primary)` : `1px solid #e3e8ee`,
                              boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                              animation: isNew ? 'taskPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                              <div style={{ fontSize: 9, padding: '3px 8px', borderRadius: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                                background: t.priority?.toLowerCase() === 'high' ? '#fee2e2' : t.priority?.toLowerCase() === 'medium' ? '#ffedd5' : '#e0f2fe',
                                color: t.priority?.toLowerCase() === 'high' ? '#dc2626' : t.priority?.toLowerCase() === 'medium' ? '#ea580c' : '#0284c7'
                              }}>
                                {t.priority || 'Low'}
                              </div>
                              {t.project_id && (
                                <div style={{ fontSize: 9, color: '#64748d', background: '#f8fafc', padding: '3px 8px', borderRadius: 6, fontWeight: 500, border: '1px solid #f1f5f9' }}>
                                  {getProjectName(t.project_id) || `Project #${t.project_id}`}
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: ns === 'completed' ? 'var(--text-muted)' : 'var(--text)', lineHeight: 1.4, textDecoration: ns === 'completed' ? 'line-through' : 'none', marginBottom: 14 }}>
                              {t.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: isLate(t.due_date, ns) ? 'var(--danger)' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} strokeWidth={2.5} /> {fmt(t.due_date)}
                              </span>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: assignedName ? avc() : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: assignedName ? '#fff' : '#64748d', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {assignedName ? ini(assignedName) : '?'}
                              </div>
                            </div>
                          </div>
                        </DraggableCard>
                      )
                    })}
                  </DroppableColumn>
                  </div>
                )
              })}
            </div>

            {/* Floating card while dragging — uses transform3d, no offset issues */}
            <DragOverlay dropAnimation={null}>
              {draggingTask ? (() => {
                const assignedName = getUserName(draggingTask.assigned_user_id)
                const ns = normalizeStatus(draggingTask.status)
                return (
                  <div style={{ background: '#fff', borderRadius: 12, padding: '14px', border: `1px solid #e3e8ee`, boxShadow: '0 20px 40px rgba(0,0,0,0.18)', cursor: 'grabbing', transform: 'rotate(1.5deg)', opacity: 0.97, width: 220 }}>
                    <div style={{ fontSize: 9, padding: '3px 8px', borderRadius: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-block', marginBottom: 10,
                      background: draggingTask.priority?.toLowerCase() === 'high' ? '#fee2e2' : draggingTask.priority?.toLowerCase() === 'medium' ? '#ffedd5' : '#e0f2fe',
                      color: draggingTask.priority?.toLowerCase() === 'high' ? '#dc2626' : draggingTask.priority?.toLowerCase() === 'medium' ? '#ea580c' : '#0284c7'
                    }}>
                      {draggingTask.priority || 'Low'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 14 }}>{draggingTask.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} strokeWidth={2.5} /> {fmt(draggingTask.due_date)}
                      </span>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: assignedName ? avc() : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: assignedName ? '#fff' : '#64748d', border: '2px solid #fff' }}>
                        {assignedName ? ini(assignedName) : '?'}
                      </div>
                    </div>
                  </div>
                )
              })() : null}
            </DragOverlay>
          </DndContext>
        ) : (
          /* Table View */
          <div style={{ flex: activeId ? '0 0 calc(100% - 295px)' : 1, transition: 'flex 0.38s cubic-bezier(0.4,0,0.2,1)', overflow: 'hidden', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div className="overflow-x-auto flex-1 flex flex-col">
              <div className="min-w-[800px] flex flex-col flex-1">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr', padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {['Task Title', 'Status', 'Priority', 'Project', 'Assignee', 'Due Date'].map(h => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
                  ))}
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: 'var(--border-input)' }}>Loading tasks...</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, fontSize: 12, color: 'var(--border-input)' }}>No tasks match your filters.</div>
              ) : (
                filtered.map(t => {
                  const ns = normalizeStatus(t.status)
                  const assignedName = getUserName(t.assigned_user_id)
                  const isNew = t.id === newlyCreatedId
                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveId(activeId === t.id ? null : t.id)}
                      style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr', padding: '12px 16px', alignItems: 'center',
                        borderBottom: '1px solid #f0f2f5', cursor: 'pointer',
                        background: activeId === t.id ? '#f8faff' : '#fff',
                        transition: 'background 0.15s',
                        borderLeft: activeId === t.id ? `3px solid #533afd` : `3px solid transparent`,
                        animation: isNew ? 'taskPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                      }}
                      onMouseEnter={(e) => { if (activeId !== t.id) e.currentTarget.style.background = '#fcfcfd' }}
                      onMouseLeave={(e) => { if (activeId !== t.id) e.currentTarget.style.background = 'var(--bg-card)' }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500, color: ns === 'completed' ? '#a8c3de' : '#0d253d', textDecoration: ns === 'completed' ? 'line-through' : 'none', paddingRight: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                      <div><span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 9999, fontWeight: 500, background: spill(ns).bg, color: spill(ns).color }}>{slabel(ns)}</span></div>
                      <div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: pdot(t.priority?.toLowerCase()), display: 'inline-block' }} />
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t.priority || 'Medium'}</span>
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748d', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {getProjectName(t.project_id) || (t.project_id ? `Project #${t.project_id}` : '—')}
                      </div>
                      <div>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: assignedName ? avc() : '#e3e8ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 600, color: assignedName ? '#fff' : '#64748d' }}>{assignedName ? ini(assignedName) : '?'}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{assignedName || '—'}</span>
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: isLate(t.due_date, ns) ? '#ea2261' : '#64748d', fontWeight: isLate(t.due_date, ns) ? 600 : 400 }}>{fmt(t.due_date)}</div>
                    </div>
                  )
                })
              )}
            </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Panel */}
        {activeTask && (() => {
          const assignedName = getUserName(activeTask.assigned_user_id)
          const ns = normalizeStatus(activeTask.status)
          return (
            <div style={{ width: 285, flexShrink: 0, marginLeft: 10 }}>
              <div style={{ width: 285, height: '100%', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: 4, background: strip(ns), flexShrink: 0 }} />
                <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => setActiveId(null)} style={{ background: 'var(--bg)', border: 'none', width: 22, height: 22, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} color="#64748d" />
                    </button>
                  </div>

                  <div style={{ background: spill(ns).bg, borderRadius: 10, padding: 12 }}>
                    <div style={{ fontSize: 8, color: 'var(--border-input)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>Task Details</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>{activeTask.title}</div>
                  </div>

                  <div style={{ height: 1, background: 'var(--bg)' }} />

                  <div>
                    <div style={{ fontSize: 8, color: 'var(--border-input)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>Details</div>
                    {[
                      { key: 'Status', val: <span style={{ fontSize: 8, padding: '2px 8px', borderRadius: 9999, fontWeight: 400, background: spill(ns).bg, color: spill(ns).color }}>{slabel(ns)}</span> },
                      { key: 'Priority', val: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: pdot(activeTask.priority?.toLowerCase()), display: 'inline-block' }} /><span style={{ fontSize: 9, color: 'var(--text)', fontWeight: 400, textTransform: 'capitalize' }}>{activeTask.priority}</span></span> },
                      { key: 'Project', val: <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 400 }}>{getProjectName(activeTask.project_id) || '—'}</span> },
                      { key: 'Assigned', val: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 16, height: 16, borderRadius: '50%', background: assignedName ? avc() : '#cbd5df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, fontWeight: 500, color: '#fff' }}>{assignedName ? ini(assignedName) : '?'}</span><span style={{ fontSize: 9, color: 'var(--text)', fontWeight: 400 }}>{assignedName || '—'}</span></span> },
                      { key: 'Due Date', val: <span style={{ fontSize: 9, color: isLate(activeTask.due_date, ns) ? '#ea2261' : '#0d253d', fontWeight: 400 }}>{fmt(activeTask.due_date)}</span> },
                    ].map(r => (
                      <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{r.key}</span>
                        {r.val}
                      </div>
                    ))}
                  </div>

                  <div style={{ height: 1, background: 'var(--bg)' }} />

                  {activeTask.description && (
                    <>
                      <div>
                        <div style={{ fontSize: 8, color: 'var(--border-input)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>Description</div>
                        <div style={{ background: 'var(--bg)', borderRadius: 7 }}>
                          <div 
                            className="prose prose-sm max-w-none prose-p:text-[13px] prose-p:leading-relaxed text-[13px] text-[#0d253d] p-3"
                            dangerouslySetInnerHTML={{ __html: activeTask.description }}
                          />
                        </div>
                      </div>
                      <div style={{ height: 1, background: 'var(--bg)' }} />
                    </>
                  )}

                  <div>
                    <div style={{ fontSize: 8, color: 'var(--border-input)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>Actions</div>

                    <button onClick={() => navigate(`/tasks/${activeTask.id}`)}
                      style={{ width: '100%', padding: 7, borderRadius: 7, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--primary)', marginBottom: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,37,61,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 16, color: 'var(--text)' }}>New Task</span>
              <button onClick={() => setShowCreate(false)} style={{ background: 'var(--bg)', border: 'none', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginBottom: 5 }}>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <RichTextEditor content={form[f.key]} onChange={html => setForm({ ...form, [f.key]: html })} />
                  ) : (
                    <input type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none' }} />
                  )}
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {!projectId && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginBottom: 5 }}>Project *</label>
                    <select value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none' }}>
                      <option value="">Select Project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginBottom: 5 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none' }}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginBottom: 5 }}>Assign To *</label>
                  <select value={form.assigned_user_id} onChange={e => setForm({ ...form, assigned_user_id: e.target.value })} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none' }}>
                    <option value="">Select Assignee</option>
                    {users.filter(u => u.is_active).map(u => <option key={u.id} value={u.id}>{roleLabel(u.role)} — {u.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '8px 16px', borderRadius: 9999, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: '8px 16px', borderRadius: 9999, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400, opacity: creating ? 0.6 : 1 }}>
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