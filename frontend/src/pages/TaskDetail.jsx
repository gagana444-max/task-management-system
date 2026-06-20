import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const ini = (n) => n?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'
const avc = (n) => ['#818cf8', '#34d399', '#60a5fa', '#f472b6', '#fb923c'][n?.charCodeAt(0) % 5] || '#818cf8'
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
const isLate = (d, s) => d && s !== 'completed' && new Date(d) < new Date()
const slabel = (s) => s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Completed'
const spill = (s) => s === 'todo' ? { bg: '#fef9e7', color: '#d97706' } : s === 'in_progress' ? { bg: '#eff6ff', color: '#2563eb' } : { bg: '#ecfdf5', color: '#059669' }
const pdot = (p) => p === 'high' ? '#dc2626' : p === 'medium' ? '#d97706' : '#059669'
const strip = (s) => s === 'todo' ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : s === 'in_progress' ? 'linear-gradient(90deg,#60a5fa,#3b82f6)' : 'linear-gradient(90deg,#34d399,#10b981)'
const normalizeStatus = (s) => {
  if (!s) return 'todo'
  const map = { 'to do': 'todo', 'in progress': 'in_progress', 'done': 'completed', 'todo': 'todo', 'in_progress': 'in_progress', 'completed': 'completed' }
  return map[s.toLowerCase()] || 'todo'
}

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef()

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('comments')
  const [error, setError] = useState('')

  const getHeaders = () => ({
    'x-user-id': String(user?.id || ''),
    'x-user-role': String(user?.role || '')
  })

  useEffect(() => {
    fetchTask()
    fetchComments()
    fetchAttachments()
  }, [id])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/tasks/${id}`)
      setTask(res.data)
    } catch {
      setError('Task not found')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/tasks/${id}`, { headers: getHeaders() })
      setComments(res.data)
    } catch { setComments([]) }
  }

  const fetchAttachments = async () => {
    try {
      const res = await api.get(`/comments/tasks/${id}/attachments`, { headers: getHeaders() })
      setAttachments(res.data)
    } catch { setAttachments([]) }
  }

  const postComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      setPosting(true)
      const res = await api.post(
        `/comments/tasks/${id}`,
        { content: newComment.trim(), task_id: parseInt(id) },
        { headers: getHeaders() }
      )
      const commentWithUser = { ...res.data, user: { name: user?.name } }
      setComments([commentWithUser, ...comments])
      setNewComment('')
    } catch {
      setError('Failed to post comment.')
    } finally {
      setPosting(false)
    }
  }

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      setUploading(true)
      const res = await api.post(`/comments/tasks/${id}/attachments`, formData, {
        headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' }
      })
      setAttachments([...attachments, res.data])
    } catch {
      setError('Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const deleteFile = async (attachmentId) => {
    if (!window.confirm('Delete this attachment?')) return
    try {
      await api.delete(`/comments/attachments/${attachmentId}`, { headers: getHeaders() })
      setAttachments(attachments.filter(a => (a.attachment_id || a.id) !== attachmentId))
    } catch {
      setError('Failed to delete attachment.')
    }
  }

  const moveTask = async (status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status })
      setTask({ ...task, status })
    } catch {
      setError('Failed to update status.')
    }
  }

  const formatSize = (b) => {
    if (!b) return ''
    return b < 1024 ? `${b}B` : b < 1048576 ? `${(b / 1024).toFixed(1)}KB` : `${(b / 1048576).toFixed(1)}MB`
  }

  const getCommentUserName = (c) => {
    if (c.author_name) return c.author_name
    if (c.user_id === user?.id) return user?.name
    return `User ${c.user_id}`
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f4f0' }}>
      <div style={{ width: 32, height: 32, border: '4px solid #818cf8', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  )

  if (!task) return (
    <div style={{ padding: 24, background: '#f5f4f0', minHeight: '100vh' }}>
      <button onClick={() => navigate(-1)} style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
      <p style={{ color: '#dc2626', marginTop: 16 }}>{error || 'Task not found.'}</p>
    </div>
  )

  const canEdit = user?.role === 'Admin' || user?.role === 'ProjectManager'
  const ns = normalizeStatus(task.status)

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", padding: 22, minHeight: '100vh', background: '#f5f4f0' }}>

      <button onClick={() => navigate('/tasks')} style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
        ← Back to Task Board
      </button>

      {error && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: 10, fontSize: 12, color: '#dc2626', display: 'flex', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5' }}>✕</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', overflow: 'hidden' }}>
            <div style={{ height: 4, background: strip(ns) }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 20, color: '#1a1a2e', letterSpacing: '-0.5px', flex: 1, lineHeight: 1.3 }}>{task.title}</h1>
                <span style={{ fontSize: 9, padding: '3px 9px', borderRadius: 7, fontWeight: 700, background: spill(ns).bg, color: spill(ns).color, marginLeft: 10, flexShrink: 0 }}>{slabel(ns)}</span>
              </div>

              {task.description && (
                <p style={{ fontSize: 13, color: '#6060a0', lineHeight: 1.6, marginBottom: 16, background: '#fafafa', borderRadius: 8, padding: '10px 12px', border: '1px solid #f0f0f8' }}>{task.description}</p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Priority', val: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: pdot(task.priority?.toLowerCase()), display: 'inline-block' }} /><span style={{ fontSize: 12, color: '#1a1a2e', fontWeight: 500, textTransform: 'capitalize' }}>{task.priority}</span></span> },
                  { label: 'Due Date', val: <span style={{ fontSize: 12, color: isLate(task.due_date, ns) ? '#dc2626' : '#1a1a2e', fontWeight: 500 }}>{fmt(task.due_date)}</span> },
                  { label: 'Assigned To', val: <span style={{ fontSize: 12, color: '#9090a0' }}>—</span> },
                  { label: 'Created', val: <span style={{ fontSize: 12, color: '#1a1a2e', fontWeight: 500 }}>{fmt(task.created_at)}</span> },
                ].map(r => (
                  <div key={r.label} style={{ background: '#f8f8fc', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 9, color: '#b0b0c0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>{r.label}</div>
                    {r.val}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {canEdit && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', padding: 16 }}>
              <div style={{ fontSize: 10, color: '#b0b0c0', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Move Task</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {ns !== 'todo' && <button onClick={() => moveTask('To Do')} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #fde68a', background: '#fef9e7', color: '#d97706' }}>To Do</button>}
                {ns !== 'in_progress' && <button onClick={() => moveTask('In Progress')} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#2563eb' }}>In Progress</button>}
                {ns !== 'completed' && <button onClick={() => moveTask('Done')} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #a7f3d0', background: '#ecfdf5', color: '#059669' }}>Completed</button>}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '80vh' }}>
          <div style={{ display: 'flex', borderBottom: '1.5px solid #f0f0f8', flexShrink: 0 }}>
            {[
              { key: 'comments', label: `💬 Comments (${comments.length})` },
              { key: 'attachments', label: `📎 Files (${attachments.length})` },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ flex: 1, padding: '12px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: 'none', background: 'none', color: activeTab === t.key ? '#1a1a2e' : '#9090a0', borderBottom: activeTab === t.key ? '2px solid #818cf8' : '2px solid transparent', transition: 'all 0.15s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'comments' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: 14, borderBottom: '1px solid #f0f0f8', flexShrink: 0 }}>
                <form onSubmit={postComment}>
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e8e8f0', fontSize: 12, fontFamily: "'Instrument Sans', sans-serif", outline: 'none', resize: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
                  <button type="submit" disabled={posting || !newComment.trim()}
                    style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#1a1a2e', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, opacity: posting || !newComment.trim() ? 0.6 : 1 }}>
                    {posting ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: '#b0b0c0', fontSize: 12 }}>No comments yet. Be the first!</div>
                ) : comments.map((c, i) => {
                  const name = getCommentUserName(c)
                  return (
                    <div key={c.comment_id || c.id || i} style={{ background: '#f8f8fc', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: avc(name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#fff' }}>
                          {ini(name)}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#1a1a2e' }}>{name}</span>
                        <span style={{ fontSize: 10, color: '#b0b0c0', marginLeft: 'auto' }}>{fmtTime(c.created_at || c.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#4060a0', lineHeight: 1.5 }}>{c.content}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: 14, borderBottom: '1px solid #f0f0f8', flexShrink: 0 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 7, border: '1.5px solid #e8e8f0', background: '#f8f8fc', fontSize: 11, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, color: '#1a1a2e' }}>
                  {uploading ? '⏳ Uploading...' : '📎 Upload File'}
                  <input type="file" ref={fileInputRef} onChange={uploadFile} disabled={uploading} style={{ display: 'none' }} />
                </label>
                <p style={{ fontSize: 10, color: '#b0b0c0', marginTop: 6 }}>Images, PDF, Word, Excel (max 5MB)</p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attachments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: '#b0b0c0', fontSize: 12 }}>No attachments yet.</div>
                ) : attachments.map((a, i) => (
                  <div key={a.attachment_id || a.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8f8fc', borderRadius: 9, padding: '10px 12px', border: '1px solid #f0f0f8' }}>
                    <span style={{ fontSize: 16 }}>📎</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.file_name || a.filename}</div>
                      {(a.file_size || a.size) && <div style={{ fontSize: 10, color: '#b0b0c0' }}>{formatSize(a.file_size || a.size)}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <a href={`http://localhost:8000/api/comments/tasks/${id}/attachments/${a.attachment_id || a.id}/download`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 10, color: '#818cf8', fontWeight: 500, textDecoration: 'none' }}>Download</a>
                      <button onClick={() => deleteFile(a.attachment_id || a.id)}
                        style={{ fontSize: 10, color: '#dc2626', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}