import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { FolderKanban, Plus, Edit, Trash2, User, Clock, CheckCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import SearchableDropdown from '../components/SearchableDropdown'
import { toast } from 'react-toastify'

const CARD_COLORS = [
  { bg: 'linear-gradient(135deg, #f5f7ff 0%, #ebf0fe 100%)', border: '#cbdcfc', iconBg: '#e0e9fe', prog: 'linear-gradient(90deg, #818cf8, #a78bfa)' },
  { bg: 'linear-gradient(135deg, #f0fdf4 0%, #e6fcf0 100%)', border: '#bbf7d0', iconBg: '#d1fae5', prog: 'linear-gradient(90deg, #34d399, #10b981)' },
  { bg: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)', border: '#bfdbfe', iconBg: '#dbeafe', prog: 'linear-gradient(90deg, #60a5fa, #3b82f6)' },
  { bg: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)', border: '#fef08a', iconBg: '#fef9c3', prog: 'linear-gradient(90deg, #fbbf24, #f59e0b)' },
  { bg: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)', border: '#f5d0fe', iconBg: '#f3e8ff', prog: 'linear-gradient(90deg, #f472b6, #ec4899)' },
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

  const canManage = user?.role === 'Admin' || user?.role === 'ProjectManager'

  // Filter users to display only Project Managers and Admins as options
  const managers = users.filter(u => u.role === 'ProjectManager' || u.role === 'Admin')
  const managerOptions = [
    { value: '', label: 'Select Project Manager' },
    ...managers.map(m => ({ value: m.id, label: `${m.name} (${m.email})` }))
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users').catch(() => ({ data: [] }))
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
    if (!window.confirm('Are you sure you want to delete this project?')) return
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

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="p-6 min-h-screen bg-[var(--bg)]">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 mr-4">
          <PageHeader
            title="Projects"
            subtitle="Manage and organize your projects and project managers"
            statText={loading ? 'Loading projects...' : `Total: ${projects.length} active project${projects.length !== 1 ? 's' : ''}`}
          />
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a2e] text-white rounded-xl text-xs font-semibold hover:bg-[#2e2e4a] transition-all shadow-[0_4px_15px_rgba(0,0,0,0.08)] cursor-pointer"
          >
            <Plus size={14} />
            New Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#a8c3de] text-sm">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
          <FolderKanban size={48} className="mx-auto mb-4 text-[#a8c3de]" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-[#0d253d]">No projects yet.</p>
          {canManage && <p className="text-xs text-[#64748d] mt-1">Click New Project to get started.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, index) => {
            const color = CARD_COLORS[index % CARD_COLORS.length]
            return (
              <div
                key={project.id}
                style={{ background: color.bg, borderColor: color.border }}
                className="border rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div style={{ background: color.iconBg }} className="w-9 h-9 rounded-xl flex items-center justify-center text-indigo-600">
                      <FolderKanban size={18} />
                    </div>
                    <span className="text-[10px] text-[#64748d] bg-white border border-[#e3e8ee] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Clock size={10} />
                      {fmt(project.created_at)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0d253d] mb-1.5 line-clamp-1">{project.name}</h3>
                  <p className="text-xs text-[#64748d] line-clamp-2 mb-4 leading-relaxed min-h-[32px]">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-black/5 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#273951]">
                      <User size={12} className="text-[#64748d]" />
                      <span className="font-semibold">PM:</span>
                      <span className="text-[#64748d]">
                        {project.manager_name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex gap-2.5 mt-2">
                      <button
                        onClick={() => openEdit(project)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white text-[#1a1a2e] border border-[#e3e8ee] rounded-lg text-[11px] font-semibold hover:border-[#1a1a2e] transition cursor-pointer"
                      >
                        <Edit size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#fff5f5] text-[#dc2626] border border-[#fecaca] rounded-lg text-[11px] font-semibold hover:bg-[#fee2e2] transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
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
