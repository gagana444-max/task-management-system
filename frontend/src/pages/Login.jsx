import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#fff', display: 'flex' }}>

      {/* Left panel — gradient mesh hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 64px',
        background: 'linear-gradient(115deg, #1c1e54 0%, #2e3070 35%, #533afd 60%, #ea2261 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Soft gradient blobs for mesh feel */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,233,212,0.25), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(234,34,97,0.2), transparent 70%)' }} />

        {/* Logo */}
        <div style={{ marginBottom: 48, position: 'relative', zIndex: 1 }}>
          <div style={{ fontWeight: 300, fontSize: 34, letterSpacing: '-0.6px' }}>
            <span style={{ color: '#ffffff' }}>Task</span>
            <span style={{ color: '#f5e9d4' }}>ify</span>
          </div>
          <p style={{ color: '#cdd2f9', fontSize: 13, marginTop: 8 }}>Task Management System</p>
        </div>

        {/* Floating task cards */}
        <div style={{ position: 'relative', height: 400, marginTop: 10, zIndex: 1 }}>
          {/* Card 1 - top left */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0,
              width: 260, background: '#fff', borderRadius: 12,
              padding: '14px 16px', border: '1px solid #e3e8ee',
              boxShadow: '0 8px 32px rgba(13,37,61,0.18)',
              transition: 'all 0.3s ease', cursor: 'pointer'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ea2261' }} />
              <span style={{ color: '#9b6829', fontSize: 10, fontWeight: 500, letterSpacing: '0.3px' }}>HIGH PRIORITY</span>
            </div>
            <p style={{ color: '#0d253d', fontSize: 13, fontWeight: 400, margin: '0 0 6px 0' }}>Build Admin Panel UI</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#533afd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>I</div>
                <span style={{ color: '#64748d', fontSize: 11 }}>Imasha · Due Today</span>
              </div>
              <span style={{ fontSize: 9, color: '#534ab7', background: '#eeedfe', padding: '2px 8px', borderRadius: 9999, fontWeight: 500 }}>Frontend</span>
            </div>
          </div>

          {/* Card 2 - middle */}
          <div
            style={{
              position: 'absolute', top: 95, left: 60,
              width: 260, background: '#fdf6e8', borderRadius: 12,
              padding: '14px 16px', border: '1px solid #f0dcb0',
              transition: 'all 0.3s ease', cursor: 'pointer', opacity: 0.95
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#9b6829' }} />
              <span style={{ color: '#9b6829', fontSize: 10, fontWeight: 500, letterSpacing: '0.3px' }}>IN PROGRESS</span>
            </div>
            <p style={{ color: '#0d253d', fontSize: 13, fontWeight: 400, margin: '0 0 6px 0' }}>Implement Kanban Board</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#533afd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>A</div>
              <span style={{ color: '#9b6829', fontSize: 11 }}>Aasif · Due Jun 19</span>
            </div>
          </div>

          {/* Card 3 - bottom right */}
          <div
            style={{
              position: 'absolute', top: 190, left: 120,
              width: 260, background: '#eaf8f1', borderRadius: 12,
              padding: '14px 16px', border: '1px solid #bfe4d6',
              transition: 'all 0.3s ease', cursor: 'pointer', opacity: 0.9
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#0f6e56' }} />
              <span style={{ color: '#0f6e56', fontSize: 10, fontWeight: 500, letterSpacing: '0.3px' }}>COMPLETED</span>
            </div>
            <p style={{ color: '#0d253d', fontSize: 13, fontWeight: 400, margin: '0 0 6px 0' }}>WebSocket Notifications</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#cbd5df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>T</div>
              <span style={{ color: '#0f6e56', fontSize: 11 }}>Thathsara · Done</span>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
            <p style={{ color: '#fff', fontSize: 16, fontWeight: 400, margin: '0 0 4px 0' }}>Your team. Your tasks.</p>
            <p style={{ color: '#cdd2f9', fontSize: 13, margin: 0 }}>Manage everything in one place.</p>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{ width: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 340 }}>
          <h2 style={{ color: '#0d253d', fontSize: 24, fontWeight: 300, margin: '0 0 6px 0', letterSpacing: '-0.4px' }}>Welcome back</h2>
          <p style={{ color: '#64748d', fontSize: 13, margin: '0 0 28px 0' }}>Sign in to continue to Taskify</p>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 12px', background: '#fdecea', border: '1px solid #f7d4d0', borderRadius: 8 }}>
              <p style={{ fontSize: 12, color: '#ea2261', margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 400, color: '#64748d', marginBottom: 6 }}>Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #a8c3de', background: '#fff', fontSize: 13, color: '#0d253d', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 400, color: '#64748d' }}>Password</label>
                <a href="/forgot-password" style={{ fontSize: 11, color: '#533afd', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: 6, border: '1px solid #a8c3de', background: '#fff', fontSize: 13, color: '#0d253d', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748d', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '11px', borderRadius: 9999, border: 'none', background: '#533afd', color: '#fff', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
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