import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import axios from 'axios'

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
      await axios.post('/api/auth/reset-password', {
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      fontFamily: "'Inter', sans-serif",
      padding: 20
    }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid var(--border)'
      }}>
        
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
  )
}
