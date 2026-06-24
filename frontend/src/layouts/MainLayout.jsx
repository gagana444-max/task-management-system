import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LayoutGrid, KanbanSquare, Bell, Users, LogOut, Moon, Sun } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { to: '/tasks', label: 'Task Board', Icon: KanbanSquare },
  { to: '/notifications', label: 'Notifications', Icon: Bell },
]

const adminItems = [
  { to: '/admin', label: 'Users', Icon: Users },
]

export default function MainLayout({ children }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="flex h-screen bg-[#f6f9fc] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-48 min-w-[192px] bg-[#1c1e54] flex flex-col py-5">
        {/* Logo */}
        <div className="px-5 pb-5 border-b border-[#2e3070] mb-3">
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: '20px', letterSpacing: '-0.3px' }}>
            <span style={{ color: '#ffffff' }}>Task</span>
            <span style={{ color: '#a9a3fd' }}>ify</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2">
          <div className="px-3 mb-1.5 text-[9px] font-medium tracking-wider uppercase text-[#6b6fa8]">Workspace</div>
          <div className="space-y-0.5 mb-4">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-normal transition-colors ${
                    isActive ? 'bg-[#665efd] text-white' : 'text-[#b9b9f9] hover:text-white hover:bg-[#2e3070]'
                  }`
                }
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* Admin only */}
          {user?.role === 'Admin' && (
            <>
              <div className="px-3 mb-1.5 text-[9px] font-medium tracking-wider uppercase text-[#6b6fa8]">Admin</div>
              <div className="space-y-0.5">
                {adminItems.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-normal transition-colors ${
                        isActive ? 'bg-[#665efd] text-white' : 'text-[#b9b9f9] hover:text-white hover:bg-[#2e3070]'
                      }`
                    }
                  >
                    <Icon size={15} strokeWidth={2} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="mt-auto px-4 pt-3 border-t border-[#2e3070]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-white font-normal truncate">{user?.name}</div>
              <div className="inline-block mt-1 text-[9px] text-[#a9a3fd] bg-[#2e3070] px-2 py-0.5 rounded font-medium tracking-wide uppercase">
                {user?.role}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-[#b9b9f9] hover:text-white hover:bg-[#2e3070] transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-1.5 text-[10px] text-[#b9b9f9] hover:text-[#ea2261] transition-colors"
          >
            <LogOut size={11} strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}