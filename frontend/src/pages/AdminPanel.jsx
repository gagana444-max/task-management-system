import { useState, useEffect } from 'react'
import { getUsers, createUser, deactivateUser, updateUserRole, sendOnboardingEmail } from '../api/users'

const ROLES = ['Admin', 'ProjectManager', 'Collaborator']

const roleStyle = {
  Admin: { card: { background: '#f5f3ff', border: '1.5px solid #ddd6fe' }, av: 'linear-gradient(135deg,#818cf8,#6366f1)', badge: { background: '#ede9fe', color: '#7c3aed' } },
  ProjectManager: { card: { background: '#f0fdf4', border: '1.5px solid #bbf7d0' }, av: 'linear-gradient(135deg,#34d399,#10b981)', badge: { background: '#d1fae5', color: '#059669' } },
  Collaborator: { card: { background: '#eff6ff', border: '1.5px solid #bfdbfe' }, av: 'linear-gradient(135deg,#60a5fa,#3b82f6)', badge: { background: '#dbeafe', color: '#2563eb' } },
}

const ini = (n) => n?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
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

  useEffect(() => { fetchUsers() }, [search, roleFilter])

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
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: `1.5px solid ${formErrors[field] ? '#fca5a5' : '#e8e8f0'}`,
    background: formErrors[field] ? '#fff5f5' : '#fff',
    fontSize: 12, fontFamily: "'Instrument Sans', sans-serif", outline: 'none'
  })

  const totalUsers = users.length
  const activeUsers = users.filter(u => u.is_active).length
  const inactiveUsers = users.filter(u => !u.is_active).length

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", padding: 22, minHeight: '100vh', background: '#f5f4f0' }}>

      {/* Topbar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 22, color: '#1a1a2e', letterSpacing: '-0.5px' }}>Team Members</h1>
          <p style={{ fontSize: 11, color: '#9090a0', marginTop: 2 }}>Manage users and their roles</p>
        </div>
        <button onClick={() => { setShowCreate(!showCreate); setFormErrors({}); setGlobalError(''); setGlobalSuccess('') }}
          style={{ background: '#1a1a2e', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ background: '#818cf8', color: '#fff', width: 16, height: 16, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>+</span>
          {showCreate ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { icon: '👥', label: 'Total Users', value: totalUsers, bg: '#fdf4ff', ibg: '#f3e8ff' },
          { icon: '✅', label: 'Active', value: activeUsers, bg: '#eff6ff', ibg: '#dbeafe' },
          { icon: '🔒', label: 'Inactive', value: inactiveUsers, bg: '#ecfdf5', ibg: '#d1fae5' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '12px 14px', border: '1.5px solid #e8e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.ibg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 20, color: '#1a1a2e', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#9090a0', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {globalError && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: '#fff5f5', border: '1.5px solid #fecaca', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#dc2626' }}>⚠</span>
          <span style={{ fontSize: 12, color: '#dc2626', flex: 1 }}>{globalError}</span>
          <button onClick={() => setGlobalError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: 12 }}>✕</button>
        </div>
      )}
      {globalSuccess && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: '#f0fdf4', border: '1.5px solid #a7f3d0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#059669' }}>✓</span>
          <span style={{ fontSize: 12, color: '#059669', flex: 1 }}>{globalSuccess}</span>
          <button onClick={() => setGlobalSuccess('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6ee7b7', fontSize: 12 }}>✕</button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e8e8f0', padding: 18, marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 14, color: '#1a1a2e', marginBottom: 14 }}>Create New User</h2>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} noValidate>
            {[
              { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Smith' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6060a0', marginBottom: 5 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setFormErrors({ ...formErrors, [f.key]: '' }) }} placeholder={f.placeholder} style={inp(f.key)} />
                {formErrors[f.key] && <p style={{ fontSize: 10, color: '#dc2626', marginTop: 3 }}>{formErrors[f.key]}</p>}
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6060a0', marginBottom: 5 }}>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inp('role')}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '7px 14px', borderRadius: 7, border: '1.5px solid #e8e8f0', background: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif" }}>Cancel</button>
              <button type="submit" disabled={creating} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: '#1a1a2e', color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, opacity: creating ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {creating && <span style={{ width: 12, height: 12, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
                {creating ? 'Creating...' : 'Create & Send Email'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name or email..."
          style={{ flex: 1, background: '#fff', border: '1.5px solid #e8e8f0', borderRadius: 7, padding: '7px 12px', fontSize: 12, color: '#1a1a2e', outline: 'none', fontFamily: "'Instrument Sans', sans-serif" }} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          style={{ background: '#fff', border: '1.5px solid #e8e8f0', borderRadius: 7, padding: '7px 12px', fontSize: 12, color: '#1a1a2e', outline: 'none', fontFamily: "'Instrument Sans', sans-serif" }}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* User Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9090a0', fontSize: 13 }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9090a0', fontSize: 13 }}>No users found.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {users.map(user => {
            const rs = roleStyle[user.role] || roleStyle.Collaborator
            return (
              <div key={user.id} style={{ ...rs.card, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: user.is_active ? 1 : 0.65 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: rs.av, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 8, fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  {ini(user.name)}
                </div>
                <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 13, color: '#1a1a2e', marginBottom: 2 }}>{user.name}</div>
                <div style={{ fontSize: 10, color: '#9090a0', marginBottom: 8 }}>{user.email}</div>
                <div style={{ ...rs.badge, fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.5px', marginBottom: 6, textTransform: 'uppercase' }}>
                  {user.role === 'ProjectManager' ? 'PROJECT MANAGER' : user.role.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, marginBottom: 10, fontWeight: 600, background: user.is_active ? '#dcfce7' : '#fee2e2', color: user.is_active ? '#16a34a' : '#dc2626' }}>
                  ● {user.is_active ? 'Active' : 'Inactive'}
                </div>

                {/* Role selector */}
                <select value={user.role} onChange={e => handleRoleChange(user, e.target.value)}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: 6, border: '1.5px solid #e8e8f0', background: '#fff', fontSize: 10, fontFamily: "'Instrument Sans', sans-serif", marginBottom: 6, outline: 'none', color: '#1a1a2e' }}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>

                <div style={{ display: 'flex', gap: 5, width: '100%' }}>
                  <button onClick={() => handleDeactivate(user)}
                    style={{ flex: 1, padding: 6, borderRadius: 6, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: user.is_active ? '1.5px solid #fecaca' : '1.5px solid #a7f3d0', background: user.is_active ? '#fff5f5' : '#f0fdf4', color: user.is_active ? '#dc2626' : '#059669' }}>
                    {user.is_active ? '🚫 Deactivate' : '✅ Activate'}
                  </button>
                  <button onClick={() => handleSendCredentials(user)}
                    style={{ flex: 1, padding: 6, borderRadius: 6, fontSize: 10, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", border: '1.5px solid #ddd6fe', background: '#f5f3ff', color: '#7c3aed' }}>
                    📧 Email
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}