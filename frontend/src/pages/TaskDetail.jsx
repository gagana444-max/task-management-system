import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, MessageSquare, Paperclip, Upload } from 'lucide-react'
import PageHeader from '../components/PageHeader'

const ini = (n) => n?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'
const avc = () => '#533afd'
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
const isLate = (d, s) => d && s !== 'completed' && new Date(d) < new Date()
const slabel = (s) => s === 'todo' ? 'To Do' : s === 'in_progress' ? 'In Progress' : 'Completed'
const spill = (s) => s === 'todo' ? { bg: '#fdf6e8', color: '#9b6829' } : s === 'in_progress' ? { bg: '#eeedfe', color: '#534ab7' } : { bg: '#e1f5ee', color: '#0f6e56' }
const pdot = (p) => p === 'high' ? '#ea2261' : p === 'medium' ? '#9b6829' : '#0f6e56'
const strip = (s) => s === 'todo' ? '#f0b97a' : s === 'in_progress' ? '#665efd' : '#5dcaa5'
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



  async function fetchTask() {
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

  async function fetchComments() {
    try {
      const res = await api.get(`/comments/tasks/${id}`, { headers: getHeaders() })
      setComments(res.data)
    } catch (e) { console.error(e); setComments([]) }
  }

  async function fetchAttachments() {
    try {
      const res = await api.get(`/comments/tasks/${id}/attachments`, { headers: getHeaders() })
      setAttachments(res.data)
    } catch (e) { console.error(e); setAttachments([]) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTask()
    fetchComments()
    fetchAttachments()
  }, [id])

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f6f9fc' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #533afd', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  )

  if (!task) return (
    <div style={{ padding: 24, background: '#f6f9fc', minHeight: '100vh' }}>
      <button onClick={() => navigate(-1)} style={{ fontSize: 12, color: '#533afd', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
      <p style={{ color: '#ea2261', marginTop: 16 }}>{error || 'Task not found.'}</p>
    </div>
  )

  const canEdit = user?.role === 'Admin' || user?.role === 'ProjectManager'
  const ns = normalizeStatus(task.status)

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: 22, minHeight: '100vh', background: '#f6f9fc' }}>

      <button onClick={() => navigate('/tasks')} style={{ fontSize: 12, color: '#533afd', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
        <ArrowLeft size={13} /> Back to Task Board
      </button>

      <PageHeader
        title={task.title}
        subtitle={`Priority: ${task.priority}`}
        statText={`Due Date: ${fmt(task.due_date)}`}
        statColor={pdot(task.priority?.toLowerCase())}
      />

      {error && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fdecea', border: '1px solid #f7d4d0', borderRadius: 10, fontSize: 12, color: '#ea2261', display: 'flex', justifyContent: 'space-between' }}>
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea2261' }}>✕</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e3e8ee', overflow: 'hidden' }}>
            <div style={{ height: 4, background: strip(ns) }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 20, color: '#0d253d', letterSpacing: '-0.3px', flex: 1, lineHeight: 1.3 }}>{task.title}</h1>
                <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 9999, fontWeight: 400, background: spill(ns).bg, color: spill(ns).color, marginLeft: 10, flexShrink: 0 }}>{slabel(ns)}</span>
              </div>

              {task.description && (
                <p style={{ fontSize: 13, color: '#64748d', lineHeight: 1.6, marginBottom: 16, background: '#f6f9fc', borderRadius: 8, padding: '10px 12px' }}>{task.description}</p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Priority', val: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: pdot(task.priority?.toLowerCase()), display: 'inline-block' }} /><span style={{ fontSize: 12, color: '#0d253d', fontWeight: 400, textTransform: 'capitalize' }}>{task.priority}</span></span> },
                  { label: 'Due Date', val: <span style={{ fontSize: 12, color: isLate(task.due_date, ns) ? '#ea2261' : '#0d253d', fontWeight: 400 }}>{fmt(task.due_date)}</span> },
                  { label: 'Assigned To', val: <span style={{ fontSize: 12, color: '#a8c3de' }}>—</span> },
                  { label: 'Created', val: <span style={{ fontSize: 12, color: '#0d253d', fontWeight: 400 }}>{fmt(task.created_at)}</span> },
                ].map(r => (
                  <div key={r.label} style={{ background: '#f6f9fc', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 9, color: '#a8c3de', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>{r.label}</div>
                    {r.val}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {canEdit && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e3e8ee', padding: 16 }}>
              <div style={{ fontSize: 10, color: '#a8c3de', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 10 }}>Move Task</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {ns !== 'todo' && <button onClick={() => moveTask('To Do')} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #f0dcb0', background: '#fdf6e8', color: '#9b6829' }}>To Do</button>}
                {ns !== 'in_progress' && <button onClick={() => moveTask('In Progress')} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #dcd9fb', background: '#f5f4fe', color: '#534ab7' }}>In Progress</button>}
                {ns !== 'completed' && <button onClick={() => moveTask('Done')} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #bfe4d6', background: '#eaf8f1', color: '#0f6e56' }}>Completed</button>}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e3e8ee', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '80vh' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e3e8ee', flexShrink: 0 }}>
            {[
              { key: 'comments', label: `Comments (${comments.length})`, Icon: MessageSquare },
              { key: 'attachments', label: `Files (${attachments.length})`, Icon: Paperclip },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ flex: 1, padding: '12px 8px', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: 'none', background: 'none', color: activeTab === t.key ? '#0d253d' : '#a8c3de', borderBottom: activeTab === t.key ? '2px solid #533afd' : '2px solid transparent', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <t.Icon size={12} /> {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'comments' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: 14, borderBottom: '1px solid #e3e8ee', flexShrink: 0 }}>
                <form onSubmit={postComment}>
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e3e8ee', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none', resize: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
                  <button type="submit" disabled={posting || !newComment.trim()}
                    style={{ padding: '6px 16px', borderRadius: 9999, border: 'none', background: '#533afd', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400, opacity: posting || !newComment.trim() ? 0.6 : 1 }}>
                    {posting ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: '#a8c3de', fontSize: 12 }}>No comments yet. Be the first!</div>
                ) : comments.map((c, i) => {
                  const name = getCommentUserName(c)
                  return (
                    <div key={c.comment_id || c.id || i} style={{ background: '#f6f9fc', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: avc(), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 500, color: '#fff' }}>
                          {ini(name)}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: '#0d253d' }}>{name}</span>
                        <span style={{ fontSize: 10, color: '#a8c3de', marginLeft: 'auto' }}>{fmtTime(c.created_at || c.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748d', lineHeight: 1.5 }}>{c.content}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: 14, borderBottom: '1px solid #e3e8ee', flexShrink: 0 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9999, border: '1px solid #e3e8ee', background: '#f6f9fc', fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400, color: '#0d253d' }}>
                  <Upload size={12} /> {uploading ? 'Uploading...' : 'Upload File'}
                  <input type="file" ref={fileInputRef} onChange={uploadFile} disabled={uploading} style={{ display: 'none' }} />
                </label>
                <p style={{ fontSize: 10, color: '#a8c3de', marginTop: 6 }}>Images, PDF, Word, Excel (max 5MB)</p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attachments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: '#a8c3de', fontSize: 12 }}>No attachments yet.</div>
                ) : attachments.map((a, i) => (
                  <div key={a.attachment_id || a.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f6f9fc', borderRadius: 9, padding: '10px 12px' }}>
                    <Paperclip size={14} color="#a8c3de" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 400, color: '#0d253d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.file_name || a.filename}</div>
                      {(a.file_size || a.size) && <div style={{ fontSize: 10, color: '#a8c3de' }}>{formatSize(a.file_size || a.size)}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <a href={`http://localhost:8000/api/comments/tasks/${id}/attachments/${a.attachment_id || a.id}/download`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 10, color: '#533afd', fontWeight: 400, textDecoration: 'none' }}>Download</a>
                      <button onClick={() => deleteFile(a.attachment_id || a.id)}
                        style={{ fontSize: 10, color: '#ea2261', fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Delete</button>
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