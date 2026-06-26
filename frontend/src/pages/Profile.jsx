import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { User, Lock, Camera, Mail, Shield, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import api from '../api/axios'

export default function Profile() {
  const { user, login } = useAuth()
  
  // Profile state
  const [name, setName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const fileInputRef = useRef(null)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Load user data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/${user.id}`)
        setName(res.data.name)
        if (res.data.avatar_url) {
          setAvatarPreview(`${api.defaults.baseURL}${res.data.avatar_url}`)
        }
      } catch (err) {
        toast.error('Failed to load profile details')
      }
    }
    fetchProfile()
  }, [user.id])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Quick preview
    const reader = new FileReader()
    reader.onload = (e) => setAvatarPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload to server immediately
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await api.post(`/users/${user.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Avatar updated successfully')
      
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to upload avatar')
      // reload original profile data to reset preview
      try {
        const profile = await api.get(`/users/${user.id}`)
        setAvatarPreview(profile.data.avatar_url ? `${api.defaults.baseURL}${profile.data.avatar_url}` : null)
      } catch {
        setAvatarPreview(null)
      }
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      await api.put(`/users/${user.id}`, { name })
      toast.success('Profile updated successfully')
      
      // Update Auth context to reflect new name across the app
      const res = await api.get(`/users/${user.id}`)
      login(res.data, localStorage.getItem('token'))
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setIsSavingPassword(true)
    try {
      await api.put(`/users/${user.id}/password`, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      })
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to change password')
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1c1e54]">My Profile</h1>
        <p className="text-gray-500 mt-2">Manage your personal information and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[var(--bg-card)] text-[var(--text)] rounded-2xl shadow-sm border border-[var(--border)] p-8 flex flex-col items-center text-center">
            
            <div 
              className="relative w-32 h-32 rounded-full mb-4 cursor-pointer group shadow-lg ring-4 ring-indigo-50 transition-all hover:ring-indigo-100"
              onClick={handleAvatarClick}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {name ? name.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white w-8 h-8" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileChange}
              />
            </div>
            
            <h2 className="text-xl font-bold text-[var(--text)]">{name || user.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{user.role}</p>
            
            <div className="mt-6 w-full pt-6 border-t border-[var(--border)] text-left space-y-4">
              <div className="flex items-center text-sm text-[var(--text-secondary)]">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                {user.email}
              </div>
              <div className="flex items-center text-sm text-[var(--text-secondary)]">
                <ShieldCheck className="w-4 h-4 mr-3 text-emerald-500" />
                Account Active
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Personal Info Form */}
          <div className="bg-[var(--bg-card)] text-[var(--text)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <User size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">Personal Information</h3>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text)]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] focus:bg-[var(--bg-card)] text-[var(--text)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text)]">Email Address <span className="text-xs text-gray-400 font-normal ml-1">(Read Only)</span></label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile || name === user.name}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Security Form */}
          <div className="bg-[var(--bg-card)] text-[var(--text)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)]">Change Password</h3>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--text)]">Current Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] focus:bg-[var(--bg-card)] text-[var(--text)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[var(--text-secondary)]"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text)]">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] focus:bg-[var(--bg-card)] text-[var(--text)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[var(--text-secondary)]"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--text)]">Confirm New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] focus:bg-[var(--bg-card)] text-[var(--text)] focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[var(--text-secondary)]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-black focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
