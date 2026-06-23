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
    <div style={{ fontFamily: "'Instrument Sans', sans-serif", minHeight: '100vh', background: '#1a1a2e', display: 'flex' }}>

      {/* Left panel — branding */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRight: '1px solid #2a2a44' }}>

        {/* Logo */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: '-1px' }}>
            <span style={{ color: '#ffffff' }}>Task</span>
            <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ify</span>
          </div>
          <p style={{ color: '#9090b0', fontSize: 14, marginTop: 8 }}>Task Management System</p>
        </div>

        {/* Floating task cards */}
        <div style={{ position: 'relative', height: 340, marginTop: 10 }}>

          {/* Card 3 - back */}
          <div style={{
            position: 'absolute', top: 120, left: 50,
            width: 270, background: '#1e1e38', borderRadius: 12,
            padding: '14px 16px', border: '1px solid #2a2a44',
            transform: 'rotate(3deg)', opacity: 0.45
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />
              <span style={{ color: '#9090b0', fontSize: 11, fontWeight: 600 }}>COMPLETED</span>
            </div>
            <p style={{ color: '#6060a0', fontSize: 13, fontWeight: 600, margin: '0 0 6px 0' }}>Write unit tests for API</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#3a3a5a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>M</div>
              <span style={{ color: '#5a5a7a', fontSize: 11 }}>Mike · Due Jun 18</span>
            </div>
          </div>

          {/* Card 2 - middle */}
          <div style={{
            position: 'absolute', top: 60, left: 25,
            width: 270, background: '#22223a', borderRadius: 12,
            padding: '14px 16px', border: '1px solid #2a2a44',
            transform: 'rotate(-2deg)', opacity: 0.7
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
              <span style={{ color: '#9090b0', fontSize: 11, fontWeight: 600 }}>IN PROGRESS</span>
            </div>
            <p style={{ color: '#c0c0e0', fontSize: 13, fontWeight: 600, margin: '0 0 6px 0' }}>Design Admin Panel UI</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>S</div>
              <span style={{ color: '#5a5a7a', fontSize: 11 }}>Sarah · Due Jun 19</span>
            </div>
          </div>

          {/* Card 1 - front */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: 270, background: '#2a2a44', borderRadius: 12,
            padding: '14px 16px', border: '1px solid #3a3a5a',
            boxShadow: '0 8px 32px rgba(129,140,248,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
              <span style={{ color: '#9090b0', fontSize: 11, fontWeight: 600 }}>HIGH PRIORITY</span>
            </div>
            <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 600, margin: '0 0 6px 0' }}>Fix authentication bug</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>J</div>
                <span style={{ color: '#9090b0', fontSize: 11 }}>John · Due Today</span>
              </div>
              <span style={{ fontSize: 10, color: '#818cf8', background: 'rgba(129,140,248,0.1)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>Dev</span>
            </div>
          </div>

          {/* Tagline below cards */}
          <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
            <p style={{ color: '#e0e0ff', fontSize: 16, fontWeight: 700, margin: '0 0 4px 0' }}>Your team. Your tasks.</p>
            <p style={{ color: '#6060a0', fontSize: 13, margin: 0 }}>Manage everything in one place.</p>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{ width: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>

        <div style={{ width: '100%', maxWidth: 340 }}>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Welcome back</h2>
          <p style={{ color: '#9090b0', fontSize: 13, margin: '0 0 28px 0' }}>Sign in to continue to Taskify</p>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>⚠ {error}</p>
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
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #3a3a5a', background: '#22223a', fontSize: 13, color: '#fff', fontFamily: "'Instrument Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
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
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #3a3a5a', background: '#22223a', fontSize: 13, color: '#fff', fontFamily: "'Instrument Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #818cf8, #a78bfa)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Instrument Sans', sans-serif", opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
            >
              {loading && <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block' }} />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}