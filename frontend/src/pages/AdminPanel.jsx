import { useState, useEffect } from 'react'
import { getUsers, createUser, deactivateUser, updateUserRole, sendOnboardingEmail } from '../api/users'
import { Users, CheckCircle2, Lock, Plus, X, Mail, UserX, UserCheck } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ViewToggle from '../components/ViewToggle'

const ROLES = ['Admin', 'ProjectManager', 'Collaborator']

const roleStyle = {
  Admin: { card: { background: '#f5f4fe', border: '1px solid #dcd9fb' }, av: '#533afd', badge: { background: '#eeedfe', color: '#534ab7' } },
  ProjectManager: { card: { background: '#eaf8f1', border: '1px solid #bfe4d6' }, av: '#0f6e56', badge: { background: '#e1f5ee', color: '#0f6e56' } },
  Collaborator: { card: { background: 'var(--bg)', border: '1px solid var(--border)' }, av: '#185fa5', badge: { background: '#e6f1fb', color: '#185fa5' } },
}

const ini = (n) => n?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [globalSuccess, setGlobalSuccess] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Collaborator' })
  const [formErrors, setFormErrors] = useState({})

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await getUsers(roleFilter, search)
      setUsers(res.data)
    } catch {
      setGlobalError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    const timer = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, roleFilter])

  const validateForm = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Name is required.'
    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email.'
    if (!form.role) errors.role = 'Role is required.'
    return errors
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setGlobalError('')
    setGlobalSuccess('')
    const errors = validateForm()
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    try {
      setCreating(true)
      const submitData = { ...form, password: 'DummyPassword123!' }
      const res = await createUser(submitData)
      const newUser = res.data
      await sendOnboardingEmail(newUser.id)
      setGlobalSuccess(`User ${newUser.name} created and onboarding email sent!`)
      setShowCreate(false)
      setForm({ name: '', email: '', password: '', role: 'Collaborator' })
      setFormErrors({})
      fetchUsers()
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Failed to create user.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeactivate = async (user) => {
    if (!window.confirm(`${user.is_active ? 'Deactivate' : 'Activate'} ${user.name}?`)) return
    try {
      await deactivateUser(user.id, !user.is_active)
      setGlobalSuccess(`User ${user.name} ${user.is_active ? 'deactivated' : 'activated'}.`)
      fetchUsers()
    } catch { setGlobalError('Failed to update user status.') }
  }

  const handleRoleChange = async (user, newRole) => {
    try {
      await updateUserRole(user.id, newRole)
      setGlobalSuccess(`Role updated for ${user.name}.`)
      fetchUsers()
    } catch { setGlobalError('Failed to update role.') }
  }

  const handleSendCredentials = async (user) => {
    try {
      await sendOnboardingEmail(user.id)
      setGlobalSuccess(`Onboarding email sent to ${user.email}.`)
    } catch { setGlobalError('Failed to send email.') }
  }

  const inp = (field) => ({
    width: '100%', padding: '8px 10px', borderRadius: 6,
    border: `1px solid ${formErrors[field] ? '#ea2261' : '#e3e8ee'}`,
    background: formErrors[field] ? '#fdecea' : '#fff',
    fontSize: 12, fontFamily: "'Inter', sans-serif", outline: 'none'
  })

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.is_active).length
  const inactiveUsers = users.filter(u => !u.is_active).length

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: 22, minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Topbar */}
      <PageHeader
        title="Team Members"
        subtitle="Manage users and their roles"
        statText={loading ? 'Loading users...' : `Total: ${totalUsers} user${totalUsers !== 1 ? 's' : ''} (${activeUsers} active)`}
        statColor="#0f6e56"
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { Icon: Users, label: 'Total Users', value: totalUsers, chipBg: '#eeedfe', chipColor: '#534ab7' },
          { Icon: CheckCircle2, label: 'Active', value: activeUsers, chipBg: '#e1f5ee', chipColor: '#0f6e56' },
          { Icon: Lock, label: 'Inactive', value: inactiveUsers, chipBg: '#fdf6e8', chipColor: '#9b6829' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.Icon size={15} color={s.chipColor} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 20, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {globalError && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fdecea', border: '1px solid #f7d4d0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#ea2261', flex: 1 }}>{globalError}</span>
          <button onClick={() => setGlobalError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ea2261', fontSize: 12 }}>✕</button>
        </div>
      )}
      {globalSuccess && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: '#eaf8f1', border: '1px solid #bfe4d6', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#0f6e56', flex: 1 }}>{globalSuccess}</span>
          <button onClick={() => setGlobalSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f6e56', fontSize: 12 }}>✕</button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: 18, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>Create New User</h2>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} noValidate>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Smith' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginBottom: 5 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setFormErrors({ ...formErrors, [f.key]: '' }) }} placeholder={f.placeholder} style={inp(f.key)} />
                {formErrors[f.key] && <p style={{ fontSize: 10, color: '#ea2261', marginTop: 3 }}>{formErrors[f.key]}</p>}
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginBottom: 5 }}>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inp('role')}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '7px 16px', borderRadius: 9999, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>Cancel</button>
              <button type="submit" disabled={creating} style={{ padding: '7px 16px', borderRadius: 9999, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400, opacity: creating ? 0.6 : 1 }}>
                {creating ? 'Creating...' : 'Create & Send Email'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', fontSize: 12, color: 'var(--text)', outline: 'none', fontFamily: "'Inter', sans-serif" }} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', fontSize: 12, color: 'var(--text)', outline: 'none', fontFamily: "'Inter', sans-serif" }}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
        <button onClick={() => { setShowCreate(!showCreate); setFormErrors({}); setGlobalError(''); setGlobalSuccess('') }}
          style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 9999, fontSize: 12, cursor: 'pointer', fontFamily: "'Inter', sans-serif", fontWeight: 400, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {showCreate ? <X size={13} /> : <Plus size={13} />}
          {showCreate ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {/* User Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--border-input)', fontSize: 13 }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--border-input)', fontSize: 13 }}>No users found.</div>
      ) : viewMode === 'board' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {users.map(user => {
            const rs = roleStyle[user.role] || roleStyle.Collaborator
            return (
              <div key={user.id} style={{ ...rs.card, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: user.is_active ? 1 : 0.6 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: rs.av, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  {ini(user.name)}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{user.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{user.email}</div>
                <div style={{ ...rs.badge, fontSize: 9, padding: '2px 10px', borderRadius: 9999, fontWeight: 500, letterSpacing: '0.3px', marginBottom: 6, textTransform: 'uppercase' }}>
                  {user.role === 'ProjectManager' ? 'PROJECT MANAGER' : user.role.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, padding: '2px 9px', borderRadius: 9999, marginBottom: 10, fontWeight: 400, background: user.is_active ? '#e1f5ee' : '#fdecea', color: user.is_active ? '#0f6e56' : '#ea2261' }}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </div>

                <select value={user.role} onChange={e => handleRoleChange(user, e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-card)', fontSize: 10, fontFamily: "'Inter', sans-serif", marginBottom: 6, outline: 'none', color: 'var(--text)' }}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <div style={{ display: 'flex', gap: 5, width: '100%' }}>
                  <button onClick={() => handleDeactivate(user)}
                    style={{ flex: 1, padding: 6, borderRadius: 9999, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: user.is_active ? '1px solid #f7d4d0' : '1px solid #bfe4d6', background: user.is_active ? '#fdecea' : '#eaf8f1', color: user.is_active ? '#ea2261' : '#0f6e56', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    {user.is_active ? <UserX size={11} /> : <UserCheck size={11} />}
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  {user.is_first_login && (
                    <button onClick={() => handleSendCredentials(user)}
                      style={{ flex: 1, padding: 6, borderRadius: 9999, fontSize: 10, fontWeight: 400, cursor: 'pointer', fontFamily: "'Inter', sans-serif", border: '1px solid #dcd9fb', background: '#f5f4fe', color: '#534ab7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <Mail size={11} /> Email
                    </button>
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
                <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)' }}>Email</th>
                <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)' }}>Role</th>
                <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 500, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const rs = roleStyle[user.role] || roleStyle.Collaborator
                return (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)', opacity: user.is_active ? 1 : 0.6 }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: rs.av, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 500, color: '#fff' }}>
                          {ini(user.name)}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{user.email}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <select value={user.role} onChange={e => handleRoleChange(user, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', fontSize: 11, outline: 'none', color: 'var(--text)' }}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: user.is_active ? '#e1f5ee' : '#fdecea', color: user.is_active ? '#0f6e56' : '#ea2261' }}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => handleDeactivate(user)} title={user.is_active ? 'Deactivate' : 'Activate'}
                          style={{ padding: 4, borderRadius: 6, border: user.is_active ? '1px solid #f7d4d0' : '1px solid #bfe4d6', background: user.is_active ? '#fdecea' : '#eaf8f1', color: user.is_active ? '#ea2261' : '#0f6e56', cursor: 'pointer' }}>
                          {user.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                        {user.is_first_login && (
                          <button onClick={() => handleSendCredentials(user)} title="Send Email"
                            style={{ padding: 4, borderRadius: 6, border: '1px solid #dcd9fb', background: '#f5f4fe', color: '#534ab7', cursor: 'pointer' }}>
                            <Mail size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}