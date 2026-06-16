import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password })
  const { access_token } = response.data
  localStorage.setItem('token', access_token)

  // Decode JWT to get user id and role
  const payload = JSON.parse(atob(access_token.split('.')[1]))
  const user = { 
    email, 
    role: payload.role, 
    name: email.split('@')[0],
    id: parseInt(payload.sub)
  }
  localStorage.setItem('user', JSON.stringify(user))
  setUser(user)

  // Check if first login
  const firstLoginCheck = await api.get(`/onboarding/check-first-login/${user.id}`)
  if (firstLoginCheck.data.is_first_login) {
    return { ...user, requiresPasswordReset: true }
  }

  return user
}

  const register = async (name, email, password, role = 'Collaborator') => {
    const response = await api.post('/auth/register', { name, email, password, role })
    const user = response.data
    // Now login to get token
    const loginResponse = await api.post('/auth/login', { email, password })
    const { access_token } = loginResponse.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}