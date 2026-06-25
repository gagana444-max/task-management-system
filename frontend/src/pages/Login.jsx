import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, CheckSquare, Activity, Users } from 'lucide-react'

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
        <div style={{ marginBottom: 48, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: 'linear-gradient(135deg, #fff, #f5e9d4)', padding: 14, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <CheckSquare size={40} color="#533afd" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 56, letterSpacing: '-1.5px', textShadow: '0 4px 12px rgba(0,0,0,0.1)', lineHeight: 1 }}>
              <span style={{ color: '#ffffff' }}>Task</span>
              <span style={{ color: '#fbd786' }}>ify</span>
            </div>
            <p style={{ color: '#cdd2f9', fontSize: 15, margin: '8px 0 0 0', fontWeight: 500 }}>Task Management System</p>
          </div>
        </div>

        {/* Floating task cards */}
        <div style={{ position: 'relative', height: 480, marginTop: 10, zIndex: 1 }}>
          {[
            { top: 0, left: 0, user: 'Gagana', initial: 'G', title: 'Database Schema Design', status: 'HIGH PRIORITY', statusColor: '#ff7eb3', due: 'Due Today' },
            { top: 85, left: 40, user: 'Imasha', initial: 'I', title: 'Build Admin Panel UI', status: 'HIGH PRIORITY', statusColor: '#ff7eb3', due: 'Due Today' },
            { top: 170, left: 80, user: 'Kirushnavy', initial: 'K', title: 'User Authentication', status: 'IN PROGRESS', statusColor: '#fbd786', due: 'Due Jun 20' },
            { top: 255, left: 120, user: 'Aasif', initial: 'A', title: 'Implement Kanban Board', status: 'IN PROGRESS', statusColor: '#fbd786', due: 'Due Jun 19' },
            { top: 340, left: 160, user: 'Thathsara', initial: 'T', title: 'WebSocket Notifications', status: 'COMPLETED', statusColor: '#00f2fe', due: 'Done' }
          ].map((card, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute', top: card.top, left: card.left,
                width: 280,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: 16,
                padding: '16px 20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
                cursor: 'pointer',
                color: '#fff',
                zIndex: 5 - idx // higher items are stacked above lower ones
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.transform = 'scale(1.05) translateY(-8px) translateX(8px)'; 
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.zIndex = 10;
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.transform = 'scale(1) translateY(0) translateX(0)'; 
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.zIndex = 5 - idx;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: card.statusColor, boxShadow: `0 0 8px ${card.statusColor}` }} />
                <span style={{ color: card.statusColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.8px' }}>{card.status}</span>
              </div>
              <p style={{ color: '#ffffff', fontSize: 15, fontWeight: 500, margin: '0 0 12px 0', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{card.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)' }}>{card.initial}</div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 400 }}>{card.user} · {card.due}</span>
              </div>
            </div>
          ))}

          {/* Creative Space Fillers */}
          {/* Widget 1: Team Activity */}
          <div style={{
            position: 'absolute', top: 30, right: 20,
            width: 220,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 20,
            padding: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} color="#00f2fe" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Weekly Activity</span>
              </div>
              <span style={{ fontSize: 12, color: '#00f2fe', fontWeight: 600 }}>+24%</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)', borderRadius: 4 }} />
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>124 tasks completed this week</p>
          </div>

          {/* Widget 2: Active Members */}
          <div style={{
            position: 'absolute', top: 220, right: -40,
            width: 180,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 20,
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
            color: '#fff',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Users size={16} color="#fbd786" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Team Online</span>
            </div>
            <div style={{ display: 'flex', marginLeft: 8 }}>
              {['I', 'A', 'T', 'G', 'K'].map((initial, i) => (
                <div key={i} style={{ 
                  width: 32, height: 32, borderRadius: '50%', 
                  background: `hsl(${i * 60 + 200}, 70%, 50%)`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 12, fontWeight: 600, color: '#fff',
                  border: '2px solid rgba(255,255,255,0.2)',
                  marginLeft: -8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {initial}
                </div>
              ))}
            </div>
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
                <Link to={`/forgot-password${form.email ? `?email=${encodeURIComponent(form.email)}` : ''}`} style={{ fontSize: 11, color: '#533afd', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
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