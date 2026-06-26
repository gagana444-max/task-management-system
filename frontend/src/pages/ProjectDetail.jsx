import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { ArrowLeft, FolderKanban, Edit, Trash2, CalendarDays } from 'lucide-react'
import TasksList from './TasksList'
import { toast } from 'react-toastify'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const ACCENT_COLORS = [
  { accent: '#6366f1', bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '#c7d2fe', dot: '#818cf8' },
  { accent: '#22c55e', bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '#86efac', dot: '#4ade80' },
  { accent: '#f97316', bg: 'linear-gradient(135deg, #fff7ed, #fed7aa)', border: '#fdba74', dot: '#fb923c' },
  { accent: '#a855f7', bg: 'linear-gradient(135deg, #fdf4ff, #f3e8ff)', border: '#d8b4fe', dot: '#c084fc' },
  { accent: '#f43f5e', bg: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', border: '#fda4af', dot: '#fb7185' },
  { accent: '#0ea5e9', bg: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '#7dd3fc', dot: '#38bdf8' },
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
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: color.dot, opacity: 0.12, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: color.dot, opacity: 0.1, pointerEvents: 'none' }} />
        <div style={{ height: 5, background: `linear-gradient(90deg, ${color.accent}, ${color.dot})` }} />

        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px ${color.accent}50`, flexShrink: 0 }}>
            <FolderKanban size={26} color="#fff" strokeWidth={1.8} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0d253d', margin: 0, letterSpacing: '-0.4px', lineHeight: 1.2 }}>{project?.name}</h1>
            <p style={{ fontSize: 13, color: '#64748d', margin: '6px 0 0', lineHeight: 1.5 }}>
              {project?.description || 'No description provided.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.7)', border: `1px solid ${color.border}`, borderRadius: 12, padding: '8px 12px', backdropFilter: 'blur(4px)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', boxShadow: `0 2px 6px ${color.accent}40` }}>
                {pmInitials}
              </div>
              <div>
                <div style={{ fontSize: 9, color: color.accent, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Manager</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0d253d' }}>{project?.manager_name || 'Unassigned'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.7)', border: `1px solid ${color.border}`, borderRadius: 12, padding: '8px 12px', backdropFilter: 'blur(4px)' }}>
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
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: 'rgba(255,255,255,0.8)', border: '1px solid #fecaca', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}
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
        <TasksList projectId={parseInt(id)} hideHeader={true} />
      </div>
    </div>
  )
}
