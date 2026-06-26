import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { FolderKanban, Plus, Edit, Trash2, User, Clock, CheckCircle, ArrowDownUp } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import SearchableDropdown from '../components/SearchableDropdown'
import ViewToggle from '../components/ViewToggle'
import { toast } from 'react-toastify'

const CARD_COLORS = [
  { bg: 'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 100%)', accent: '#6366f1', border: '#c7d2fe', iconBg: '#6366f1', dot1: '#818cf8', dot2: '#a5b4fc', text: '#5b21b6' }, // Indigo
  { bg: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)', accent: '#22c55e', border: '#86efac', iconBg: '#22c55e', dot1: '#4ade80', dot2: '#86efac', text: '#166534' }, // Green
  { bg: 'linear-gradient(145deg, #fff7ed 0%, #fed7aa 100%)', accent: '#f97316', border: '#fdba74', iconBg: '#f97316', dot1: '#fb923c', dot2: '#fcd34d', text: '#9a3412' }, // Orange
  { bg: 'linear-gradient(145deg, #fdf4ff 0%, #f3e8ff 100%)', accent: '#a855f7', border: '#d8b4fe', iconBg: '#a855f7', dot1: '#c084fc', dot2: '#e879f9', text: '#5b21b6' }, // Purple
  { bg: 'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)', accent: '#f43f5e', border: '#fda4af', iconBg: '#f43f5e', dot1: '#fb7185', dot2: '#fda4af', text: '#9f1239' }, // Rose
  { bg: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)', accent: '#0ea5e9', border: '#7dd3fc', iconBg: '#0ea5e9', dot1: '#38bdf8', dot2: '#7dd3fc', text: '#075985' }, // Sky
  { bg: 'linear-gradient(145deg, #fdf8e6 0%, #fef08a 100%)', accent: '#eab308', border: '#fde047', iconBg: '#eab308', dot1: '#facc15', dot2: '#fde047', text: '#854d0e' }, // Yellow
  { bg: 'linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 100%)', accent: '#14b8a6', border: '#99f6e4', iconBg: '#14b8a6', dot1: '#2dd4bf', dot2: '#99f6e4', text: '#115e59' }, // Teal
  { bg: 'linear-gradient(145deg, #fdf2f8 0%, #fce7f3 100%)', accent: '#ec4899', border: '#fbcfe8', iconBg: '#ec4899', dot1: '#f472b6', dot2: '#fbcfe8', text: '#831843' }, // Pink
  { bg: 'linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)', accent: '#8b5cf6', border: '#ddd6fe', iconBg: '#8b5cf6', dot1: '#a78bfa', dot2: '#ddd6fe', text: '#4c1d95' }, // Violet
  { bg: 'linear-gradient(145deg, #ecfeff 0%, #cffafe 100%)', accent: '#06b6d4', border: '#a5f3fc', iconBg: '#06b6d4', dot1: '#22d3ee', dot2: '#a5f3fc', text: '#164e63' }, // Cyan
  { bg: 'linear-gradient(145deg, #fef2f2 0%, #fee2e2 100%)', accent: '#ef4444', border: '#fecaca', iconBg: '#ef4444', dot1: '#f87171', dot2: '#fecaca', text: '#7f1d1d' }, // Red
  { bg: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)', accent: '#64748b', border: '#e2e8f0', iconBg: '#64748b', dot1: '#94a3b8', dot2: '#e2e8f0', text: '#0f172a' }, // Slate
  { bg: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)', accent: '#3b82f6', border: '#bfdbfe', iconBg: '#3b82f6', dot1: '#60a5fa', dot2: '#bfdbfe', text: '#1e3a8a' }, // Blue
]

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', manager_id: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('board')

  const canManage = user?.role === 'Admin' || user?.role === 'ProjectManager'
  const navigate = useNavigate()

  // Filter users to display only Project Managers and Admins as options
  const managers = users.filter(u => u.is_active && (u.role === 'ProjectManager' || u.role === 'Admin'))
  const managerOptions = [
    { value: '', label: 'Select Project Manager' },
    ...managers.map(m => ({ value: m.id, label: `${m.name} (${m.email})` }))
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users?exclude_role=Admin').catch(() => ({ data: [] }))
      ])
      setProjects(projRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Project name is required.')
    if (!form.manager_id) return setError('Project Manager is required.')
    try {
      setSaving(true)
      const payload = {
        name: form.name.trim(),
        description: form.description ? form.description.trim() : null,
        manager_id: Number(form.manager_id)
      }
      const res = await api.post('/projects', payload)
      setProjects([res.data, ...projects])
      setShowCreate(false)
      setForm({ name: '', description: '', manager_id: '' })
      setError('')
      toast.success(`Project "${res.data.name}" created successfully!`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.')
      toast.error(err.response?.data?.message || 'Failed to create project.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Project name is required.')
    if (!form.manager_id) return setError('Project Manager is required.')
    try {
      setSaving(true)
      const payload = {
        name: form.name.trim(),
        description: form.description ? form.description.trim() : null,
        manager_id: Number(form.manager_id)
      }
      const res = await api.put(`/projects/${showEdit.id}`, payload)
      setProjects(projects.map(p => p.id === showEdit.id ? res.data : p))
      setShowEdit(null)
      setForm({ name: '', description: '', manager_id: '' })
      setError('')
      toast.success(`Project "${res.data.name}" updated successfully!`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project.')
      toast.error(err.response?.data?.message || 'Failed to update project.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? WARNING: All tasks assigned to this project will also be permanently deleted!')) return
    try {
      const projectObj = projects.find(p => p.id === id)
      await api.delete(`/projects/${id}`)
      setProjects(projects.filter(p => p.id !== id))
      toast.success(`Deleted project "${projectObj?.name || 'project'}"`)
    } catch (err) {
      toast.error('Failed to delete project.')
    }
  }

  const openEdit = (project) => {
    setShowEdit(project)
    setForm({
      name: project.name,
      description: project.description || '',
      manager_id: project.manager_id || ''
    })
    setError('')
  }

  const openCreate = () => {
    setShowCreate(true)
    setForm({ name: '', description: '', manager_id: '' })
    setError('')
  }

  let filteredProjects = projects.filter(p => 
    (p.name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (p.description?.toLowerCase() || '').includes(search.toLowerCase())
  )

  filteredProjects.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || b.id) - new Date(a.created_at || a.id)
    if (sortBy === 'oldest') return new Date(a.created_at || a.id) - new Date(b.created_at || b.id)
    if (sortBy === 'a-z') return (a.name || '').localeCompare(b.name || '')
    if (sortBy === 'z-a') return (b.name || '').localeCompare(a.name || '')
    return 0
  })

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="p-6 min-h-screen bg-[var(--bg)]">
      <PageHeader
        title="Projects"
        subtitle="Manage and organize your projects and project managers"
        statText={loading ? 'Loading projects...' : `Total: ${filteredProjects.length} active project${filteredProjects.length !== 1 ? 's' : ''}`}
      />
      <div className="flex items-center justify-end flex-shrink-0 mb-6 mt-1">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            style={{ background: 'var(--bg-card)', border: '1px solid #e3e8ee', borderRadius: 6, padding: '7px 11px', fontSize: 11, color: 'var(--text)', outline: 'none', width: 140, fontFamily: "'Inter', sans-serif" }}
          />
          <div className="flex items-center gap-1.5 ml-1 border-l border-[#e3e8ee] pl-3">
            <ArrowDownUp size={14} color="#64748d" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: 11, color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="a-z">Name A-Z</option>
              <option value="z-a">Name Z-A</option>
            </select>
            <div className="mx-1">
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>
            {canManage && (
              <button
                onClick={openCreate}
                style={{ padding: '7px 14px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} /> New Project
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#a8c3de] text-sm">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
          <FolderKanban size={48} className="mx-auto mb-4 text-[#a8c3de]" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-[#0d253d]">No projects found.</p>
          {canManage && search === '' && <p className="text-xs text-[#64748d] mt-1">Click New Project to get started.</p>}
        </div>
      ) : viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => {
            const hash = String(project.id).split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
            const color = CARD_COLORS[Math.abs(hash) % CARD_COLORS.length]
            const initials = project.name?.slice(0, 2).toUpperCase() || 'PR'
            const pmInitials = project.manager_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{
                  background: color.bg,
                  border: `1.5px solid ${color.border}`,
                  borderRadius: 20,
                  padding: 0,
                  overflow: 'hidden',
                  boxShadow: `0 4px 20px ${color.accent}18`,
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${color.accent}30` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${color.accent}18` }}
              >
                {/* Top accent bar */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${color.accent}, ${color.dot1})`, flexShrink: 0 }} />

                {/* Card body */}
                <div style={{ padding: '18px 20px 16px', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    {/* Icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: color.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${color.accent}40`, flexShrink: 0 }}>
                      <FolderKanban size={20} color="#fff" strokeWidth={1.8} />
                    </div>
                    {/* Date badge */}
                    <span style={{ fontSize: 10, color: color.accent, background: 'rgba(255,255,255,0.75)', border: `1px solid ${color.border}`, padding: '4px 10px', borderRadius: 20, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
                      <Clock size={10} />
                      {fmt(project.created_at)}
                    </span>
                  </div>

                  {/* Project name */}
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0d253d', marginBottom: 6, lineHeight: 1.3, letterSpacing: '-0.2px' }} className="line-clamp-1">{project.name}</h3>

                  {/* Description */}
                  <p style={{ fontSize: 12, color: '#64748d', lineHeight: 1.6, marginBottom: 16, minHeight: 38 }} className="line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>

                  {/* PM row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.6)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', marginBottom: canManage ? 14 : 0 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: color.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: `0 2px 6px ${color.accent}40` }}>
                      {pmInitials}
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: color.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Manager</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#0d253d' }}>{project.manager_name || 'Unassigned'}</div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {canManage && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(project); }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', background: 'rgba(255,255,255,0.8)', color: '#0d253d', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 0', background: 'rgba(255,255,255,0.8)', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,38,38,0.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)' }}>Project Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)' }}>Description</th>
                <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)' }}>Project Manager</th>
                <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)' }}>Created Date</th>
                {canManage && <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, index) => {
                const color = CARD_COLORS[index % CARD_COLORS.length]
                return (
                  <tr key={project.id} className="hover:bg-gray-50/50 transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text)', fontWeight: 500 }}>
                      <div className="flex items-center gap-3">
                        <div style={{ background: color.iconBg }} className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600">
                          <FolderKanban size={14} />
                        </div>
                        {project.name}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      <div className="line-clamp-1 max-w-xs">{project.description || '—'}</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text)' }}>
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-[#64748d]" />
                        {project.manager_name || 'Unassigned'}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {fmt(project.created_at)}
                      </div>
                    </td>
                    {canManage && (
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button onClick={() => openEdit(project)} title="Edit"
                            style={{ padding: 5, borderRadius: 6, border: '1px solid #e3e8ee', background: '#fff', color: '#1a1a2e', cursor: 'pointer' }}>
                            <Edit size={13} />
                          </button>
                          <button onClick={() => handleDelete(project.id)} title="Delete"
                            style={{ padding: 5, borderRadius: 6, border: '1px solid #fecaca', background: '#fff5f5', color: '#dc2626', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[420px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-[#0d253d] text-base">New Project</h3>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 rounded-lg bg-[#f6f9fc] hover:bg-[#e2e8f0] text-[#64748d] flex items-center justify-center text-xs transition cursor-pointer">Γ£ò</button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748d] mb-1.5">Project Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm({ ...form, name: e.target.value }); setError('') }}
                  placeholder="Enter project name"
                  className="w-full px-3.5 py-2 border border-[#e3e8ee] rounded-xl text-xs outline-none focus:border-[#1a1a2e] transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748d] mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3.5 py-2 border border-[#e3e8ee] rounded-xl text-xs outline-none focus:border-[#1a1a2e] transition resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748d] mb-1.5">Assigned Project Manager *</label>
                <SearchableDropdown
                  options={managerOptions}
                  value={form.manager_id}
                  onChange={(val) => setForm({ ...form, manager_id: val })}
                  placeholder="Select Project Manager"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-[#e3e8ee] rounded-xl text-xs font-semibold hover:bg-[#f6f9fc] transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#1a1a2e] text-white rounded-xl text-xs font-semibold hover:bg-[#2e2e4a] transition disabled:opacity-50 cursor-pointer">
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[420px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-[#0d253d] text-base">Edit Project</h3>
              <button onClick={() => setShowEdit(null)} className="w-7 h-7 rounded-lg bg-[#f6f9fc] hover:bg-[#e2e8f0] text-[#64748d] flex items-center justify-center text-xs transition cursor-pointer">Γ£ò</button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748d] mb-1.5">Project Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm({ ...form, name: e.target.value }); setError('') }}
                  placeholder="Enter project name"
                  className="w-full px-3.5 py-2 border border-[#e3e8ee] rounded-xl text-xs outline-none focus:border-[#1a1a2e] transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748d] mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full px-3.5 py-2 border border-[#e3e8ee] rounded-xl text-xs outline-none focus:border-[#1a1a2e] transition resize-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#64748d] mb-1.5">Assigned Project Manager *</label>
                <SearchableDropdown
                  options={managerOptions}
                  value={form.manager_id}
                  onChange={(val) => setForm({ ...form, manager_id: val })}
                  placeholder="Select Project Manager"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowEdit(null)} className="px-4 py-2 border border-[#e3e8ee] rounded-xl text-xs font-semibold hover:bg-[#f6f9fc] transition cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-[#1a1a2e] text-white rounded-xl text-xs font-semibold hover:bg-[#2e2e4a] transition disabled:opacity-50 cursor-pointer">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
