import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Mail, CheckSquare } from 'lucide-react'
import api from '../api/axios'

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const initialEmail = searchParams.get('email') || ''
  
  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      setErrorMsg('Please enter your email address')
      setStatus('error')
      return
    }

    try {
      setStatus('loading')
      await api.post('/auth/forgot-password', { email: email.trim() })
      setStatus('success')
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to process request. Please try again later.'
      setErrorMsg(errMsg)
      setStatus('error')
    }
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

      {/* Right panel — forgot password form */}
      <div className="w-full md:w-[420px] flex flex-col items-center justify-center p-8 md:p-12 mx-auto">
        <div style={{ width: '100%', maxWidth: 340 }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: 48, 
              height: 48, 
              background: 'rgba(79, 70, 229, 0.1)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
            <Mail size={24} color="#4F46E5" />
          </div>
          <h2 style={{ fontSize: '24px', color: 'var(--text)', marginBottom: '8px', fontWeight: 600 }}>Forgot Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5 }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              background: '#eaf8f1', 
              color: '#0f6e56', 
              padding: '16px', 
              borderRadius: '8px', 
              fontSize: '14px',
              marginBottom: '24px',
              border: '1px solid #bfe4d6'
            }}>
              If an account exists for <strong>{email}</strong>, you will receive a password reset email shortly.
            </div>
            <Link to="/login" style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8, 
              color: 'var(--primary)', 
              textDecoration: 'none', 
              fontSize: '14px',
              fontWeight: 500
            }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
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
                border: '1px solid #f7d4d0'
              }}>
                {errorMsg}
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  fontSize: '14px',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                marginBottom: '20px',
                transition: 'opacity 0.2s'
              }}
            >
              {status === 'loading' ? 'Sending link...' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link to="/login" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 8, 
                color: 'var(--text-muted)', 
                textDecoration: 'none', 
                fontSize: '14px',
                transition: 'color 0.2s'
              }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  )
}
