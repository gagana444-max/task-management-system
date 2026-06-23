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
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1.5px solid ${errors[field] ? '#f87171' : '#3a3a5a'}`,
    background: '#1a1a2e', fontSize: 13, color: '#fff',
    fontFamily: "'Instrument Sans', sans-serif", outline: 'none', boxSizing: 'border-box',
  })

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: '-1px' }}>
            Task<span style={{ color: '#818cf8' }}>Flow</span>
          </div>
          <p style={{ color: '#9090b0', fontSize: 13, marginTop: 4 }}>Create your account</p>
        </div>

        <div style={{ background: '#22223a', borderRadius: 16, padding: 28, border: '1.5px solid #2a2a44' }}>

          {globalError && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#f87171' }}>⚠ {globalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }} noValidate>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9090b0', marginBottom: 6 }}>Full name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Smith" style={inp('name')} />
              {errors.name && <p style={{ fontSize: 10, color: '#f87171', marginTop: 4 }}>{errors.name}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9090b0', marginBottom: 6 }}>Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={inp('email')} />
              {errors.email && <p style={{ fontSize: 10, color: '#f87171', marginTop: 4 }}>{errors.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9090b0', marginBottom: 6 }}>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" style={inp('password')} />
              {errors.password && <p style={{ fontSize: 10, color: '#f87171', marginTop: 4 }}>{errors.password}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9090b0', marginBottom: 6 }}>Confirm password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" style={inp('confirmPassword')} />
              {errors.confirmPassword && <p style={{ fontSize: 10, color: '#f87171', marginTop: 4 }}>{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#818cf8', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
            >
              {loading && <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9090b0', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>

        </div>
    </div>
  )
}