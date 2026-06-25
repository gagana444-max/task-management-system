import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { LayoutGrid, KanbanSquare, Bell, Users, LogOut, Moon, Sun, FolderKanban, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutGrid },
  { to: '/tasks', label: 'Task Board', Icon: KanbanSquare },
  { to: '/projects', label: 'Projects', Icon: FolderKanban },
  { to: '/notifications', label: 'Notifications', Icon: Bell },
]


const adminItems = [
  { to: '/admin', label: 'Users', Icon: Users },
]

export default function MainLayout({ children }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="flex h-screen bg-[#f6f9fc] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-48 min-w-[192px]' : 'w-[68px] min-w-[68px]'} bg-[#1c1e54] flex flex-col py-5 transition-all duration-300 relative`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 bg-[#2e3070] text-white p-1 rounded-full border border-[#1c1e54] z-10 hover:bg-[#665efd] transition-colors"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Logo */}
        <div className="px-5 pb-5 border-b border-[#2e3070] mb-3 overflow-hidden whitespace-nowrap flex items-center gap-2.5">
          {isSidebarOpen ? (
            <>
              <div style={{ background: 'linear-gradient(135deg, #fff, #f5e9d4)', padding: 6, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', flexShrink: 0 }}>
                <CheckSquare size={16} color="#533afd" strokeWidth={2.5} />
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '22px', letterSpacing: '-0.5px', lineHeight: 1 }}>
                <span style={{ color: '#ffffff' }}>Task</span>
                <span style={{ color: '#fbd786' }}>ify</span>
              </div>
            </>
          ) : (
            <div style={{ background: 'linear-gradient(135deg, #fff, #f5e9d4)', padding: 7, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', marginLeft: -5 }}>
              <CheckSquare size={16} color="#533afd" strokeWidth={2.5} />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 overflow-hidden">
          {isSidebarOpen && <div className="px-3 mb-1.5 text-[9px] font-medium tracking-wider uppercase text-[#6b6fa8] whitespace-nowrap">Workspace</div>}
          <div className="space-y-0.5 mb-4">
            {navItems.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={!isSidebarOpen ? label : ''}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-normal transition-colors whitespace-nowrap ${
                    isActive ? 'bg-[#665efd] text-white' : 'text-[#b9b9f9] hover:text-white hover:bg-[#2e3070]'
                  } ${!isSidebarOpen && 'justify-center px-0'}`
                }
              >
                <Icon size={15} strokeWidth={2} className="min-w-[15px]" />
                {isSidebarOpen && label}
              </NavLink>
            ))}
          </div>

          {/* Admin only */}
          {user?.role === 'Admin' && (
            <>
              {isSidebarOpen && <div className="px-3 mb-1.5 text-[9px] font-medium tracking-wider uppercase text-[#6b6fa8] whitespace-nowrap">Admin</div>}
              <div className="space-y-0.5">
                {adminItems.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    title={!isSidebarOpen ? label : ''}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-normal transition-colors whitespace-nowrap ${
                        isActive ? 'bg-[#665efd] text-white' : 'text-[#b9b9f9] hover:text-white hover:bg-[#2e3070]'
                      } ${!isSidebarOpen && 'justify-center px-0'}`
                    }
                  >
                    <Icon size={15} strokeWidth={2} className="min-w-[15px]" />
                    {isSidebarOpen && label}
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User footer */}
        <div className={`mt-auto px-4 pt-3 border-t border-[#2e3070] overflow-hidden ${!isSidebarOpen && 'flex flex-col items-center px-2'}`}>
          <div className={`flex items-center mb-2 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
            {isSidebarOpen && (
              <div className="whitespace-nowrap overflow-hidden">
                <div className="text-xs text-white font-normal truncate">{user?.name}</div>
                <div className="inline-block mt-1 text-[9px] text-[#a9a3fd] bg-[#2e3070] px-2 py-0.5 rounded font-medium tracking-wide uppercase">
                  {user?.role}
                </div>
              </div>
            )}
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
            title={!isSidebarOpen ? 'Sign out' : ''}
            className={`mt-1 flex items-center gap-1.5 text-[10px] text-[#b9b9f9] hover:text-[#ea2261] transition-colors ${!isSidebarOpen && 'justify-center'}`}
          >
            <LogOut size={11} strokeWidth={2} className="min-w-[11px]" />
            {isSidebarOpen && 'Sign out'}
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