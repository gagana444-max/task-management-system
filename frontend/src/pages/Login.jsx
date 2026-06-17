import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email) return setError('Email is required.')
    if (!form.password) return setError('Password is required.')
    try {
      setLoading(true)
      const user = await login(form.email, form.password)
      if (user.requiresPasswordReset) navigate('/first-login-reset')
      else if (user.role === 'Admin') navigate('/admin')
      else navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", minHeight: '100vh', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 32, color: '#fff', letterSpacing: '-1px' }}>
            Task<span style={{ color: '#818cf8' }}>Flow</span>
          </div>
          <p style={{ color: '#9090b0', fontSize: 13, marginTop: 4 }}>Sign in to your workspace</p>
        </div>

        <div style={{ background: '#22223a', borderRadius: 16, padding: 28, border: '1.5px solid #2a2a44' }}>
          {error && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#f87171' }}>⚠ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9090b0', marginBottom: 6 }}>Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #3a3a5a', background: '#1a1a2e', fontSize: 13, color: '#fff', fontFamily: "'Instrument Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#9090b0', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #3a3a5a', background: '#1a1a2e', fontSize: 13, color: '#fff', fontFamily: "'Instrument Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '10px', borderRadius: 8, border: 'none', background: '#818cf8', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Instrument Sans', sans-serif", opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
            >
              {loading && <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#5a5a7a', marginTop: 20 }}>
          Task Management System · INTE 21323
        </p>
      </div>
    </div>
  )
}