import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { resetPassword } from '../api/users'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function FirstLoginReset() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ temp_password: '', new_password: '', confirm_password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')
  const [showPassword, setShowPassword] = useState({ temp_password: false, new_password: false, confirm_password: false })

  const toggleVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

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
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: `1px solid ${errors[field] ? '#ea2261' : '#a8c3de'}`,
    background: '#fff', fontSize: 13, color: '#0d253d',
    fontFamily: "'Inter', sans-serif", outline: 'none',
  })

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif", minHeight: '100vh',
      background: 'linear-gradient(115deg, #1c1e54 0%, #2e3070 35%, #533afd 60%, #ea2261 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>

      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontWeight: 300, fontSize: 30, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#fff' }}>Task</span>
            <span style={{ color: '#f5e9d4' }}>ify</span>
          </div>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px auto 10px' }}>
            <Lock size={20} color="#fff" />
          </div>
          <p style={{ fontSize: 17, fontWeight: 400, color: '#fff' }}>Reset Your Password</p>
          <p style={{ fontSize: 12, color: '#cdd2f9', marginTop: 4 }}>You must change your password before continuing</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e3e8ee' }}>
          {globalError && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: '#fdecea', border: '1px solid #f7d4d0', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#ea2261', margin: 0 }}>{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>
            {[
              { label: 'Temporary Password', key: 'temp_password', placeholder: 'Enter temporary password' },
              { label: 'New Password', key: 'new_password', placeholder: 'Min 8 chars, upper, lower, number, special' },
              { label: 'Confirm New Password', key: 'confirm_password', placeholder: 'Re-enter new password' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: '#64748d', marginBottom: 6 }}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword[f.key] ? "text" : "password"}
                    value={form[f.key]}
                    onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setErrors({ ...errors, [f.key]: '' }) }}
                    placeholder={f.placeholder}
                    style={{...inp(f.key), paddingRight: 36}}
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(f.key)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748d', padding: 0, display: 'flex' }}
                  >
                    {showPassword[f.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors[f.key] && <p style={{ fontSize: 10, color: '#ea2261', marginTop: 4 }}>{errors[f.key]}</p>}
              </div>
            ))}

            {/* Password requirements */}
            <div style={{ background: '#f5f4fe', border: '1px solid #dcd9fb', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, fontWeight: 500, color: '#534ab7', marginBottom: 5 }}>Password requirements:</p>
              <ul style={{ fontSize: 10, color: '#64748d', paddingLeft: 14, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {['Minimum 8 characters', 'At least one uppercase letter', 'At least one lowercase letter', 'At least one number', 'At least one special character (!@#$%^&*)'].map(r => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '10px', borderRadius: 9999, border: 'none', background: '#533afd', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading && <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}