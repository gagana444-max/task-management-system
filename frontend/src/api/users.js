import api from './axios'

export const getUsers = (role = '', q = '') =>
  api.get(`/users?role=${role}&q=${q}`)

export const createUser = (data) =>
  api.post('/users', data)

export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data)

export const deactivateUser = (id, isActive) =>
  api.patch(`/users/${id}/status`, { is_active: isActive })

export const updateUserRole = (id, role) =>
  api.patch(`/users/${id}/role`, { role })

export const sendOnboardingEmail = (id) =>
  api.post(`/onboarding/send-credentials/${id}`)

export const checkFirstLogin = (id) =>
  api.get(`/onboarding/check-first-login/${id}`)

export const resetPassword = (id, data) =>
  api.post(`/onboarding/reset-password/${id}`, data)