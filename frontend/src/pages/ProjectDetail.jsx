import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { ArrowLeft, FolderKanban, Edit, Trash2, CalendarDays } from 'lucide-react'
import TasksList from './TasksList'
import { toast } from 'react-toastify'

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const ACCENT_COLORS = [
  { accent: '#c7d2fe', bg: 'linear-gradient(135deg, #4f46e5, #6366f1)', border: '#4f46e5', dot: '#818cf8', text: '#ffffff' },
  { accent: '#bbf7d0', bg: 'linear-gradient(135deg, #16a34a, #22c55e)', border: '#16a34a', dot: '#4ade80', text: '#ffffff' },
  { accent: '#fed7aa', bg: 'linear-gradient(135deg, #ea580c, #f97316)', border: '#ea580c', dot: '#fb923c', text: '#ffffff' },
  { accent: '#e9d5ff', bg: 'linear-gradient(135deg, #9333ea, #a855f7)', border: '#9333ea', dot: '#c084fc', text: '#ffffff' },
  { accent: '#fecdd3', bg: 'linear-gradient(135deg, #e11d48, #f43f5e)', border: '#e11d48', dot: '#fb7185', text: '#ffffff' },
  { accent: '#bae6fd', bg: 'linear-gradient(135deg, #0284c7, #0ea5e9)', border: '#0284c7', dot: '#38bdf8', text: '#ffffff' },
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
          <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
            <FolderKanban size={26} color="#fff" strokeWidth={1.8} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', margin: 0, letterSpacing: '-0.4px', lineHeight: 1.2 }}>{project?.name}</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '6px 0 0', lineHeight: 1.5 }}>
              {project?.description || 'No description provided.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', border: `1px solid rgba(255,255,255,0.3)`, borderRadius: 12, padding: '8px 12px', backdropFilter: 'blur(8px)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: color.border, boxShadow: `0 2px 6px rgba(0,0,0,0.15)` }}>
                {pmInitials}
              </div>
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Manager</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>{project?.manager_name || 'Unassigned'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', border: `1px solid rgba(255,255,255,0.3)`, borderRadius: 12, padding: '8px 12px', backdropFilter: 'blur(8px)' }}>
              <CalendarDays size={14} color="#fff" />
              <div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#ffffff' }}>{fmt(project?.created_at)}</div>
              </div>
            </div>

            {canManage && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleDelete}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 10, fontSize: 11, fontWeight: 600, color: '#dc2626', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
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
