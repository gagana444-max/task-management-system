import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — all roles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected routes — Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <MainLayout>
                  <div className="text-gray-500 text-sm">Admin panel coming in Phase 3</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Tasks page placeholder */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-gray-500 text-sm">Task board coming in Phase 2</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Notifications placeholder */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-gray-500 text-sm">Notifications coming in Phase 2</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}