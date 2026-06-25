import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import axios from 'axios'

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
      await axios.post('/api/auth/forgot-password', { email })
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to process request. Please try again later.')
      setStatus('error')
    }
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
  )
}
