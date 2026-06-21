import { useState, useEffect } from 'react'
import { getUsers, createUser, deactivateUser, updateUserRole, sendOnboardingEmail } from '../api/users'

const ROLES = ['Admin', 'ProjectManager', 'Collaborator']

const roleBadge = {
  Admin: 'bg-red-100 text-red-700 border-red-200',
  ProjectManager: 'bg-blue-100 text-blue-700 border-blue-200',
  Collaborator: 'bg-green-100 text-green-700 border-green-200',
}

export default function AdminPanel() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
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
    } catch (err) {
      setGlobalError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter])

  const validateForm = () => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Name is required.'
    if (!form.email.trim()) errors.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email.'
    if (!form.password) errors.password = 'Password is required.'
    else if (form.password.length < 8) errors.password = 'Min 8 characters.'
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
      const res = await createUser(form)
      const newUser = res.data
      await sendOnboardingEmail(newUser.id)
      setGlobalSuccess(`User ${newUser.name} created and onboarding email sent!`)
      setShowCreateForm(false)
      setForm({ name: '', email: '', password: '', role: 'Collaborator' })
      setFormErrors({})
      fetchUsers()
    } catch (err) {
      setGlobalError(err.response?.data?.message || err.response?.data?.detail || 'Failed to create user.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeactivate = async (user) => {
    if (!window.confirm(`${user.is_active ? 'Deactivate' : 'Activate'} ${user.name}?`)) return
    try {
      await deactivateUser(user.id, !user.is_active)
      setGlobalSuccess(`User ${user.name} ${user.is_active ? 'deactivated' : 'activated'} successfully.`)
      fetchUsers()
    } catch (err) {
      setGlobalError('Failed to update user status.')
    }
  }

  const handleRoleChange = async (user, newRole) => {
    try {
      await updateUserRole(user.id, newRole)
      setGlobalSuccess(`Role updated for ${user.name}.`)
      fetchUsers()
    } catch (err) {
      setGlobalError('Failed to update role.')
    }
  }

  const handleSendCredentials = async (user) => {
    try {
      await sendOnboardingEmail(user.id)
      setGlobalSuccess(`Onboarding email sent to ${user.email}.`)
    } catch (err) {
      setGlobalError('Failed to send email.')
    }
  }

  const inputClass = (field) =>
    `w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
      formErrors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users, roles and access</p>
        </div>
        <button
          onClick={() => { setShowCreateForm(!showCreateForm); setFormErrors({}); setGlobalError(''); setGlobalSuccess('') }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {showCreateForm ? 'Cancel' : '+ New User'}
        </button>
      </div>

      {/* Global messages */}
      {globalError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <span className="text-red-500">⚠</span>
          <p className="text-red-600 text-sm">{globalError}</p>
          <button onClick={() => setGlobalError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      {globalSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <span className="text-green-500">✓</span>
          <p className="text-green-600 text-sm">{globalSuccess}</p>
          <button onClick={() => setGlobalSuccess('')} className="ml-auto text-green-400 hover:text-green-600">✕</button>
        </div>
      )}

      {/* Create user form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Create New User</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); setFormErrors({ ...formErrors, name: '' }) }}
                placeholder="John Smith"
                className={inputClass('name')}
              />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); setFormErrors({ ...formErrors, email: '' }) }}
                placeholder="john@example.com"
                className={inputClass('email')}
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => { setForm({ ...form, password: e.target.value }); setFormErrors({ ...formErrors, password: '' }) }}
                placeholder="Min 8 characters"
                className={inputClass('password')}
              />
              {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className={inputClass('role')}
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg transition flex items-center gap-2"
              >
                {creating && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {creating ? 'Creating...' : 'Create & Send Email'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50 transition ${!user.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={e => handleRoleChange(user, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border ${roleBadge[user.role]} focus:outline-none`}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${user.is_active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeactivate(user)}
                        className={`text-xs px-2 py-1 rounded border transition ${user.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleSendCredentials(user)}
                        className="text-xs px-2 py-1 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition"
                      >
                        Send Email
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}