import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { resetPassword } from '../api/users'

export default function FirstLoginReset() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    temp_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const validate = () => {
    const newErrors = {}
    if (!form.temp_password) newErrors.temp_password = 'Temporary password is required.'
    if (!form.new_password) newErrors.new_password = 'New password is required.'
    else if (form.new_password.length < 8) newErrors.new_password = 'Min 8 characters.'
    else if (!/[A-Z]/.test(form.new_password)) newErrors.new_password = 'Must contain uppercase letter.'
    else if (!/[a-z]/.test(form.new_password)) newErrors.new_password = 'Must contain lowercase letter.'
    else if (!/[0-9]/.test(form.new_password)) newErrors.new_password = 'Must contain a number.'
    else if (!/[!@#$%^&*]/.test(form.new_password)) newErrors.new_password = 'Must contain special character (!@#$%^&*).'
    if (!form.confirm_password) newErrors.confirm_password = 'Please confirm your password.'
    else if (form.new_password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match.'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)
      await resetPassword(user.id, form)
      navigate('/dashboard')
    } catch (err) {
      setGlobalError(err.response?.data?.message || err.response?.data?.detail || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Your Password</h1>
          <p className="text-gray-500 text-sm mt-1">You must change your password before continuing</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {globalError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <span className="text-red-500">⚠</span>
              <p className="text-red-600 text-sm">{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Temporary Password</label>
              <input
                type="password"
                value={form.temp_password}
                onChange={e => { setForm({ ...form, temp_password: e.target.value }); setErrors({ ...errors, temp_password: '' }) }}
                placeholder="Enter temporary password"
                className={inputClass('temp_password')}
              />
              {errors.temp_password && <p className="text-red-500 text-xs mt-1">{errors.temp_password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input
                type="password"
                value={form.new_password}
                onChange={e => { setForm({ ...form, new_password: e.target.value }); setErrors({ ...errors, new_password: '' }) }}
                placeholder="Min 8 chars, upper, lower, number, special"
                className={inputClass('new_password')}
              />
              {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={form.confirm_password}
                onChange={e => { setForm({ ...form, confirm_password: e.target.value }); setErrors({ ...errors, confirm_password: '' }) }}
                placeholder="Re-enter new password"
                className={inputClass('confirm_password')}
              />
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password}</p>}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-700">
              <p className="font-medium mb-1">Password requirements:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Minimum 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
                <li>At least one special character (!@#$%^&*)</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 mt-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}