import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
    setGlobalError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Full name is required.'
    if (!form.email.trim()) newErrors.email = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Please enter a valid email.'
    if (!form.password) newErrors.password = 'Password is required.'
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters.'
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    try {
      setLoading(true)
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setGlobalError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp = (field) => ({
    width: '100%', padding: '10px 12px', borderRadius: 6,
    border: `1px solid ${errors[field] ? '#ea2261' : '#a8c3de'}`,
    background: '#fff', fontSize: 13, color: '#0d253d',
    fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box',
  })

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif", minHeight: '100vh',
      background: 'linear-gradient(115deg, #1c1e54 0%, #2e3070 35%, #533afd 60%, #ea2261 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontWeight: 300, fontSize: 30, letterSpacing: '-0.5px' }}>
            <span style={{ color: '#fff' }}>Task</span>
            <span style={{ color: '#f5e9d4' }}>ify</span>
          </div>
          <p style={{ color: '#cdd2f9', fontSize: 13, marginTop: 4 }}>Create your account</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e3e8ee' }}>

          {globalError && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: '#fdecea', border: '1px solid #f7d4d0', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#ea2261', margin: 0 }}>{globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: '#64748d', marginBottom: 6 }}>Full name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Smith" style={inp('name')} />
              {errors.name && <p style={{ fontSize: 10, color: '#ea2261', marginTop: 4 }}>{errors.name}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: '#64748d', marginBottom: 6 }}>Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={inp('email')} />
              {errors.email && <p style={{ fontSize: 10, color: '#ea2261', marginTop: 4 }}>{errors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: '#64748d', marginBottom: 6 }}>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" style={inp('password')} />
              {errors.password && <p style={{ fontSize: 10, color: '#ea2261', marginTop: 4 }}>{errors.password}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: '#64748d', marginBottom: 6 }}>Confirm password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" style={inp('confirmPassword')} />
              {errors.confirmPassword && <p style={{ fontSize: 10, color: '#ea2261', marginTop: 4 }}>{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '10px', borderRadius: 9999, border: 'none', background: '#533afd', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
            >
              {loading && <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#64748d', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#533afd', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}