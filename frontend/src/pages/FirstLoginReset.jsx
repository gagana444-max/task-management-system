import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { resetPassword } from '../api/users'

export default function FirstLoginReset() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ temp_password: '', new_password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.temp_password) e.temp_password = 'Temporary password is required.'
    if (!form.new_password) e.new_password = 'New password is required.'
    else if (form.new_password.length < 8) e.new_password = 'Min 8 characters.'
    else if (!/[A-Z]/.test(form.new_password)) e.new_password = 'Must contain uppercase letter.'
    else if (!/[a-z]/.test(form.new_password)) e.new_password = 'Must contain lowercase letter.'
    else if (!/[0-9]/.test(form.new_password)) e.new_password = 'Must contain a number.'
    else if (!/[!@#$%^&*]/.test(form.new_password)) e.new_password = 'Must contain special character.'
    if (!form.confirm_password) e.confirm_password = 'Please confirm your password.'
    else if (form.new_password !== form.confirm_password) e.confirm_password = 'Passwords do not match.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGlobalError('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
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

  const inp = (field) => ({
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1.5px solid ${errors[field] ? '#fca5a5' : '#3a3a5a'}`,
    background: '#1a1a2e', fontSize: 13, color: '#fff',
    fontFamily: "'Instrument Sans', sans-serif", outline: 'none',
  })

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif" }}
      className="min-h-screen bg-[#1a1a2e] flex items-center justify-center p-4">

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: '-1px' }}>
            Task<span style={{ color: '#818cf8' }}>Flow</span>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#2a2a44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '16px auto 8px' }}>🔒</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Cabinet Grotesk', sans-serif" }}>Reset Your Password</p>
          <p style={{ fontSize: 12, color: '#9090b0', marginTop: 4 }}>You must change your password before continuing</p>
        </div>

        {/* Card */}
        <div style={{ background: '#22223a', borderRadius: 16, padding: 24, border: '1.5px solid #2a2a44' }}>
          {globalError && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#f87171' }}>⚠ {globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
            {[
              { label: 'Temporary Password', key: 'temp_password', placeholder: 'Enter temporary password' },
              { label: 'New Password', key: 'new_password', placeholder: 'Min 8 chars, upper, lower, number, special' },
              { label: 'Confirm New Password', key: 'confirm_password', placeholder: 'Re-enter new password' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9090b0', marginBottom: 6 }}>{f.label}</label>
                <input
                  type="password"
                  value={form[f.key]}
                  onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setErrors({ ...errors, [f.key]: '' }) }}
                  placeholder={f.placeholder}
                  style={inp(f.key)}
                />
                {errors[f.key] && <p style={{ fontSize: 10, color: '#f87171', marginTop: 4 }}>{errors[f.key]}</p>}
              </div>
            ))}

            {/* Password requirements */}
            <div style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#818cf8', marginBottom: 5 }}>Password requirements:</p>
              <ul style={{ fontSize: 10, color: '#9090b0', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['Minimum 8 characters', 'At least one uppercase letter', 'At least one lowercase letter', 'At least one number', 'At least one special character (!@#$%^&*)'].map(r => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#818cf8', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading && <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}