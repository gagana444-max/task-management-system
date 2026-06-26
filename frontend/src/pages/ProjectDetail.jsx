import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { ArrowLeft, FolderKanban, Edit, Trash2, CalendarDays } from 'lucide-react'
import TasksList from './TasksList'
import { toast } from 'react-toastify'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const ACCENT_COLORS = [
  { bg: 'linear-gradient(145deg, #eef2ff 0%, #e0e7ff 100%)', accent: '#6366f1', border: '#c7d2fe', iconBg: '#6366f1', dot: '#818cf8', dot2: '#a5b4fc' },
  { bg: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)', accent: '#22c55e', border: '#86efac', iconBg: '#22c55e', dot: '#4ade80', dot2: '#86efac' },
  { bg: 'linear-gradient(145deg, #fff7ed 0%, #fed7aa 100%)', accent: '#f97316', border: '#fdba74', iconBg: '#f97316', dot: '#fb923c', dot2: '#fcd34d' },
  { bg: 'linear-gradient(145deg, #fdf4ff 0%, #f3e8ff 100%)', accent: '#a855f7', border: '#d8b4fe', iconBg: '#a855f7', dot: '#c084fc', dot2: '#e879f9' },
  { bg: 'linear-gradient(145deg, #fff1f2 0%, #ffe4e6 100%)', accent: '#f43f5e', border: '#fda4af', iconBg: '#f43f5e', dot: '#fb7185', dot2: '#fda4af' },
  { bg: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)', accent: '#0ea5e9', border: '#7dd3fc', iconBg: '#0ea5e9', dot: '#38bdf8', dot2: '#7dd3fc' },
]

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  const canManage = user?.role === 'Admin' || user?.role === 'ProjectManager'
  const color = ACCENT_COLORS[(parseInt(id) - 1) % ACCENT_COLORS.length]

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/projects/${id}`)
        setProject(res.data)
      } catch {
        toast.error('Project not found')
        navigate('/projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  const handleDelete = async () => {
    if (!window.confirm(`Delete project "${project?.name}"? This will also remove all its tasks.`)) return
    try {
      await api.delete(`/projects/${id}`)
      toast.success(`Project "${project.name}" deleted`)
      navigate('/projects')
    } catch {
      toast.error('Failed to delete project')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e0e7ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, color: '#64748d' }}>Loading project...</p>
        </div>
      </div>
    )
  }

  const pmInitials = project?.manager_name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: '24px 24px 0', display: 'flex', flexDirection: 'column', height: '100%', gap: 16 }}>

      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748d', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'fit-content', fontFamily: "'Inter', sans-serif" }}
      >
        <ArrowLeft size={14} strokeWidth={2} />
        Back to Projects
      </button>

      {/* Project header card */}
      <div style={{
        background: color.bg,
        border: `1.5px solid ${color.border}`,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: `0 4px 24px ${color.accent}20`,
        position: 'relative',
        flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: color.dot, opacity: 0.15, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: color.dot2, opacity: 0.2, pointerEvents: 'none' }} />
        <div style={{ height: 5, background: `linear-gradient(90deg, ${color.accent}, ${color.dot})` }} />

        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 relative z-10">
          <div style={{ width: 54, height: 54, borderRadius: 16, background: color.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${color.accent}40` }}>
            <FolderKanban size={26} color="#fff" strokeWidth={1.8} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0d253d', margin: 0, letterSpacing: '-0.4px', lineHeight: 1.2 }}>{project?.name}</h1>
            <p style={{ fontSize: 13, color: '#64748d', margin: '6px 0 0', lineHeight: 1.5 }}>
              {project?.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-2.5 shrink-0">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.6)', border: `1px solid rgba(255,255,255,0.9)`, borderRadius: 12, padding: '8px 12px', backdropFilter: 'blur(8px)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: color.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', boxShadow: `0 2px 6px ${color.accent}40` }}>
                {pmInitials}
              </div>
              <div>
                <div style={{ fontSize: 9, color: color.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Manager</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0d253d' }}>{project?.manager_name || 'Unassigned'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.6)', border: `1px solid rgba(255,255,255,0.9)`, borderRadius: 12, padding: '8px 12px', backdropFilter: 'blur(8px)' }}>
              <CalendarDays size={14} color={color.accent} />
              <div>
                <div style={{ fontSize: 9, color: color.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0d253d' }}>{fmt(project?.created_at)}</div>
              </div>
            </div>

            {canManage && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleDelete}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: 'rgba(255,255,255,0.8)', border: '1px solid #fecaca', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#dc2626', cursor: 'pointer', boxShadow: 'none' }}
                >
                  <Trash2 size={13} /> Delete Project
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task board filtered to this project */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <TasksList projectId={parseInt(id)} hideHeader={true} initialViewMode="table" />
      </div>
    </div>
  )
}
