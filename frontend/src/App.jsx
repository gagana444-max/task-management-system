import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layouts/MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TasksList from './pages/TasksList'
import TaskDetail from './pages/TaskDetail'
import AdminPanel from './pages/AdminPanel'
import FirstLoginReset from './pages/FirstLoginReset'
import Notifications from './pages/Notifications'
import Projects from './pages/Projects'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/first-login-reset" element={<FirstLoginReset />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes — all roles */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout><Dashboard /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <MainLayout><TasksList /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/tasks/:id" element={
                <ProtectedRoute>
                  <MainLayout><TaskDetail /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <MainLayout><Notifications /></MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <MainLayout><Projects /></MainLayout>
                </ProtectedRoute>
              } />


              {/* Admin only */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <MainLayout><AdminPanel /></MainLayout>
                </ProtectedRoute>
              } />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}