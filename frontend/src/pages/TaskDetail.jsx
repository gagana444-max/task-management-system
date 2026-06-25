import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { ArrowLeft, MessageSquare, Paperclip, Upload, Edit3, X, Trash2 } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import RichTextEditor from '../components/RichTextEditor'
import { toast } from 'react-toastify'

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
  const { socket } = useSocket()
  const fileInputRef = useRef()
  const typingTimeoutRef = useRef(null)

  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [attachments, setAttachments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('comments')
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])
  
  const [showEdit, setShowEdit] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '', priority: 'Medium', due_date: '', assigned_user_id: '' })
  
  const [typingUsers, setTypingUsers] = useState(new Set())

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
      const res = await api.get(`/tasks/${id}/comments`, { headers: getHeaders() })
      setComments(res.data)
    } catch (e) { console.error(e); setComments([]) }
  }

  async function fetchAttachments() {
    try {
      const res = await api.get(`/tasks/${id}/attachments`, { headers: getHeaders() })
      setAttachments(res.data)
    } catch (e) { console.error(e); setAttachments([]) }
  }

  async function fetchUsers() {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (e) { console.error(e) }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTask()
    fetchComments()
    fetchAttachments()
    fetchUsers()
  }, [id])

  useEffect(() => {
    if (!socket) return
    
    const handleTyping = ({ user_id, task_id, is_typing }) => {
      if (parseInt(task_id) !== parseInt(id)) return
      if (user_id === user?.id) return
      
      setTypingUsers(prev => {
        const next = new Set(prev)
        if (is_typing) next.add(user_id)
        else next.delete(user_id)
        return next
      })
    }

    socket.on('typing', handleTyping)
    return () => socket.off('typing', handleTyping)
  }, [socket, id, user])

  const handleTypingChange = (val) => {
    setNewComment(val)
    if (socket) {
      socket.emit('typing', { task_id: id, is_typing: true })
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { task_id: id, is_typing: false })
      }, 2000)
    }
  }

  const postComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      setPosting(true)
      const res = await api.post(
        `/tasks/${id}/comments`,
        { content: newComment.trim(), task_id: parseInt(id) },
        { headers: getHeaders() }
      )
      const commentWithUser = { ...res.data, user: { name: user?.name } }
      setComments([commentWithUser, ...comments])
      setNewComment('')
      toast.success('Comment posted successfully!')
    } catch {
      setError('Failed to post comment.')
      toast.error('Failed to post comment.')
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
      const res = await api.post(`/tasks/${id}/attachments`, formData, {
        headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' }
      })
      setAttachments([...attachments, res.data])
      toast.success('Attachment uploaded successfully!')
    } catch {
      setError('Upload failed.')
      toast.error('Upload failed.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const deleteFile = async (attachmentId) => {
    if (!window.confirm('Delete this attachment?')) return
    try {
      await api.delete(`/tasks/attachments/${attachmentId}`, { headers: getHeaders() })
      setAttachments(attachments.filter(a => (a.attachment_id || a.id) !== attachmentId))
      toast.success('Attachment deleted successfully!')
    } catch {
      setError('Failed to delete attachment.')
      toast.error('Failed to delete attachment.')
    }
  }

  const moveTask = async (status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status })
      setTask({ ...task, status })
      toast.success(`Task status updated to: ${status}`)
    } catch {
      setError('Failed to update status.')
      toast.error('Failed to update status.')
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

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted successfully!')
      navigate('/tasks')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete task.')
      toast.error(err.response?.data?.detail || 'Failed to delete task.')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await api.delete(`/tasks/comments/${commentId}`)
      setComments(comments.filter(c => (c.comment_id || c.id) !== commentId))
      toast.success('Comment deleted successfully!')
    } catch {
      setError('Failed to delete comment.')
      toast.error('Failed to delete comment.')
    }
  }

  const handleEditOpen = () => {
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'Medium',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assigned_user_id: task.assigned_user_id || ''
    })
    setShowEdit(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editForm.title.trim()) return setError('Title is required.')
    try {
      setEditing(true)
      const payload = { ...editForm }
      if (!payload.assigned_user_id) payload.assigned_user_id = null
      const res = await api.put(`/tasks/${id}`, payload)
      setTask(res.data)
      setShowEdit(false)
      setError('')
      toast.success('Task updated successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task.')
      toast.error(err.response?.data?.detail || 'Failed to update task.')
    } finally {
      setEditing(false)
    }
  }

  const getUserName = (userId) => {
    if (!userId) return null
    const u = users.find(u => u.id === userId)
    return u ? u.name : null
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ width: 32, height: 32, border: '3px solid #533afd', borderTopColor: 'transparent', borderRadius: '50%' }} />
    </div>
  )

  if (!task) return (
    <div style={{ padding: 24, background: 'var(--bg)', minHeight: '100vh' }}>
      <button onClick={() => navigate(-1)} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
      <p style={{ color: '#ea2261', marginTop: 16 }}>{error || 'Task not found.'}</p>
    </div>
  )

  const canEdit = user?.role === 'Admin' || user?.role === 'ProjectManager'
  const ns = normalizeStatus(task.status)

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: 22, minHeight: '100vh', background: 'var(--bg)' }}>

      <button onClick={() => navigate('/tasks')} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
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
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ height: 4, background: strip(ns) }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 20, color: 'var(--text)', letterSpacing: '-0.3px', flex: 1, lineHeight: 1.3 }}>{task.title}</h1>
                <span style={{ fontSize: 9, padding: '3px 10px', borderRadius: 9999, fontWeight: 400, background: spill(ns).bg, color: spill(ns).color, marginLeft: 10, flexShrink: 0 }}>{slabel(ns)}</span>
              </div>

              {task.description && (
                <div style={{ marginBottom: 16, background: 'var(--bg)', borderRadius: 8 }}>
                  <RichTextEditor content={task.description} editable={false} onChange={() => {}} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Priority', val: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: pdot(task.priority?.toLowerCase()), display: 'inline-block' }} /><span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 400, textTransform: 'capitalize' }}>{task.priority}</span></span> },
                  { label: 'Due Date', val: <span style={{ fontSize: 12, color: isLate(task.due_date, ns) ? '#ea2261' : '#0d253d', fontWeight: 400 }}>{fmt(task.due_date)}</span> },
                  { label: 'Assigned To', val: <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 16, height: 16, borderRadius: '50%', background: getUserName(task.assigned_user_id) ? avc() : '#e3e8ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 600, color: getUserName(task.assigned_user_id) ? '#fff' : '#64748d' }}>{getUserName(task.assigned_user_id) ? ini(getUserName(task.assigned_user_id)) : '?'}</span><span style={{ fontSize: 12, color: 'var(--text)' }}>{getUserName(task.assigned_user_id) || '—'}</span></span> },
                  { label: 'Created', val: <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 400 }}>{fmt(task.created_at)}</span> },
                ].map(r => (
                  <div key={r.label} style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 9, color: 'var(--border-input)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>{r.label}</div>
                    {r.val}
                  </div>
                ))}
              </div>
            </div>
            
            {canEdit && (
              <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={handleDeleteTask} style={{ background: 'var(--bg-card)', border: '1px solid #f7d4d0', color: '#ea2261', padding: '6px 14px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.background = '#fdecea'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}>
                  <Trash2 size={13} color="#ea2261" /> Delete Task
                </button>
                <button onClick={handleEditOpen} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 14px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}>
                  <Edit3 size={13} color="#64748d" /> Edit Task
                </button>
              </div>
            )}
          </div>

          {canEdit && (
            <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--border-input)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 10 }}>Move Task</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {ns !== 'todo' && <button onClick={() => moveTask('To Do')} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #f0dcb0', background: '#fdf6e8', color: '#9b6829' }}>To Do</button>}
                {ns !== 'in_progress' && <button onClick={() => moveTask('In Progress')} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #dcd9fb', background: '#f5f4fe', color: '#534ab7' }}>In Progress</button>}
                {ns !== 'completed' && <button onClick={() => moveTask('Done')} style={{ flex: 1, padding: '8px', borderRadius: 7, fontSize: 11, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #bfe4d6', background: '#eaf8f1', color: '#0f6e56' }}>Completed</button>}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: '80vh' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
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
              <div style={{ padding: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <form onSubmit={postComment}>
                  <textarea value={newComment} onChange={e => handleTypingChange(e.target.value)} placeholder="Write a comment..." rows={2}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none', resize: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', height: 16 }}>
                      {typingUsers.size > 0 && `${Array.from(typingUsers).map(uid => users.find(u => u.id === parseInt(uid))?.name || 'Someone').join(', ')} ${typingUsers.size > 1 ? 'are' : 'is'} typing...`}
                    </div>
                    <button type="submit" disabled={posting || !newComment.trim()}
                      style={{ padding: '6px 16px', borderRadius: 9999, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400, opacity: posting || !newComment.trim() ? 0.6 : 1 }}>
                      {posting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: 'var(--border-input)', fontSize: 12 }}>No comments yet. Be the first!</div>
                ) : comments.map((c, i) => {
                  const name = getCommentUserName(c)
                  const cid = c.comment_id || c.id
                  const canDeleteComment = canEdit || c.user_id === user?.id
                  return (
                    <div key={cid || i} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: avc(), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 500, color: '#fff' }}>
                          {ini(name)}
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)' }}>{name}</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, color: 'var(--border-input)' }}>{fmtTime(c.created_at || c.createdAt)}</span>
                          {canDeleteComment && (
                            <button onClick={() => handleDeleteComment(cid)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: 'var(--border-input)' }} title="Delete comment" onMouseEnter={e => e.currentTarget.style.color = '#ea2261'} onMouseLeave={e => e.currentTarget.style.color = '#a8c3de'}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.content}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: 14, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9999, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: 11, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400, color: 'var(--text)' }}>
                  <Upload size={12} /> {uploading ? 'Uploading...' : 'Upload File'}
                  <input type="file" ref={fileInputRef} onChange={uploadFile} disabled={uploading} style={{ display: 'none' }} />
                </label>
                <p style={{ fontSize: 10, color: 'var(--border-input)', marginTop: 6 }}>Images, PDF, Word, Excel (max 5MB)</p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attachments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: 'var(--border-input)', fontSize: 12 }}>No attachments yet.</div>
                ) : attachments.map((a, i) => (
                  <div key={a.attachment_id || a.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', borderRadius: 9, padding: '10px 12px' }}>
                    <Paperclip size={14} color="#a8c3de" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.file_name || a.filename}</div>
                      {(a.file_size || a.size) && <div style={{ fontSize: 10, color: 'var(--border-input)' }}>{formatSize(a.file_size || a.size)}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/tasks/${id}/attachments/${a.attachment_id || a.id}/download`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 400, textDecoration: 'none' }}>Download</a>
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
      
      {/* Edit Task Modal */}
      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,37,61,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 24, width: 440, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: 'var(--text)' }}>Edit Task</span>
              <button onClick={() => setShowEdit(false)} style={{ background: 'var(--bg)', border: 'none', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={13} color="#64748d" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Title *', key: 'title', type: 'text', placeholder: 'Task title' },
                { label: 'Description', key: 'description', type: 'textarea', placeholder: 'Optional description' },
                { label: 'Due Date', key: 'due_date', type: 'date', placeholder: '' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text)', marginBottom: 5 }}>{f.label}</label>
                  {f.type === 'textarea' ? (
                    <RichTextEditor content={editForm[f.key]} onChange={html => setEditForm({ ...editForm, [f.key]: html })} />
                  ) : (
                    <input type={f.type} value={editForm[f.key]} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' }} />
                  )}
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text)', marginBottom: 5 }}>Priority</label>
                  <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box', background: 'var(--bg-card)' }}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text)', marginBottom: 5 }}>Assign To</label>
                  <select value={editForm.assigned_user_id} onChange={e => setEditForm({ ...editForm, assigned_user_id: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box', background: 'var(--bg-card)' }}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.role === 'ProjectManager' ? 'Project Manager' : u.role} — {u.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setShowEdit(false)} style={{ padding: '9px 18px', borderRadius: 9999, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: 'var(--text)', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={editing} style={{ padding: '9px 18px', borderRadius: 9999, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 500, opacity: editing ? 0.7 : 1 }}>
                  {editing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}