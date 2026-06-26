import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, CheckCircle2, AlertCircle, CheckSquare, ArrowLeft } from 'lucide-react'
import api from '../api/axios'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [form, setForm] = useState({ new_password: '', confirm_password: '' })
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setErrorMsg('Invalid or missing password reset token. Please request a new link.')
      setStatus('error')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return

    if (form.new_password !== form.confirm_password) {
      setErrorMsg('Passwords do not match')
      setStatus('error')
      return
    }

    try {
      setStatus('loading')
      await api.post('/auth/reset-password', {
        token,
        new_password: form.new_password,
        confirm_password: form.confirm_password
      })
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to reset password. The link might be expired.')
      setStatus('error')
    }
  }

  const inp = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--bg)',
    fontSize: '14px',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 0.2s',
    marginBottom: '16px'
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Left panel — gradient mesh hero */}
      <div className="hidden md:flex flex-1 flex-col justify-center p-16 relative overflow-hidden" style={{
        background: 'linear-gradient(115deg, #1c1e54 0%, #2e3070 35%, #533afd 60%, #ea2261 100%)',
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
      </div>

      {/* Right panel — reset password form */}
      <div className="w-full md:w-[420px] flex flex-col items-center justify-center p-8 md:p-12 mx-auto">
        <div style={{ width: '100%', maxWidth: 340 }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: 48, 
              height: 48, 
              background: status === 'success' ? '#e1f5ee' : 'rgba(79, 70, 229, 0.1)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              {status === 'success' ? <CheckCircle2 size={24} color="#0f6e56" /> : <Lock size={24} color="#4F46E5" />}
            </div>
            <h2 style={{ fontSize: '24px', color: 'var(--text)', marginBottom: '8px', fontWeight: 600 }}>
              {status === 'success' ? 'Password Reset!' : 'Reset Password'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
              {status === 'success' ? 'Your password has been successfully updated.' : 'Please enter your new password below.'}
            </p>
          </div>

        {status === 'success' ? (
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Continue to Login
          </button>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === 'error' && (
              <div style={{ 
                background: '#fdecea', 
                color: '#ea2261', 
                padding: '12px', 
                borderRadius: '8px', 
                fontSize: '13px',
                marginBottom: '20px',
                border: '1px solid #f7d4d0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>
                New Password
              </label>
              <input
                type="password"
                required
                disabled={!token || status === 'loading'}
                value={form.new_password}
                onChange={(e) => {
                  setForm({ ...form, new_password: e.target.value })
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="Enter new password"
                style={inp}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                disabled={!token || status === 'loading'}
                value={form.confirm_password}
                onChange={(e) => {
                  setForm({ ...form, confirm_password: e.target.value })
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="Confirm new password"
                style={inp}
              />
            </div>

            <button
              type="submit"
              disabled={!token || status === 'loading'}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: !token || status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: !token || status === 'loading' ? 0.7 : 1,
                marginTop: '8px',
                transition: 'opacity 0.2s'
              }}
            >
              {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link to="/login" style={{ 
                color: 'var(--text-muted)', 
                textDecoration: 'none', 
                fontSize: '14px',
              }}>
                Return to Login
              </Link>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  )
}
