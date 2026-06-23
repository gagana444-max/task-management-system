import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/tasks', label: 'Task Board', icon: '▦' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
]

const adminItems = [
  { to: '/admin', label: 'Users', icon: '👤' },
]

export default function MainLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const ini = (name) => name?.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif" }} className="flex h-screen bg-[#f5f4f0] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-48 min-w-[192px] bg-[#1a1a2e] flex flex-col py-5">
        {/* Logo */}
        <div className="px-5 pb-5 border-b border-[#2a2a44] mb-3">
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: '22px', letterSpacing: '-0.5px' }}>
  <span style={{ color: '#ffffff' }}>Task</span>
  <span style={{ 
    background: 'linear-gradient(135deg, #818cf8, #a78bfa)', 
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent',
    fontWeight: 900
  }}>ify</span>
</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-[#2a2a44] text-white' : 'text-[#9090b0] hover:text-white hover:bg-[#2a2a44]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isActive ? 'bg-[#818cf8]' : 'bg-[#3a3a5a]'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}

          {/* Admin only */}
          {user?.role === 'Admin' && adminItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-[#2a2a44] text-white' : 'text-[#9090b0] hover:text-white hover:bg-[#2a2a44]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isActive ? 'bg-[#818cf8]' : 'bg-[#3a3a5a]'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="mt-auto px-4 pt-3 border-t border-[#2a2a44]">
          <div className="text-xs text-[#e0e0ff] font-medium truncate">{user?.name}</div>
          <div className="inline-block mt-1 text-[9px] text-[#818cf8] bg-[#2a2a44] px-2 py-0.5 rounded font-semibold tracking-wide uppercase">
            {user?.role}
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 text-[10px] text-[#9090b0] hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}