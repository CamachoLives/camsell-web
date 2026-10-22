import { apiGet, apiPost, apiPut } from '@/shared/api/client'
import type { Session, User, UserRole } from '@/shared/api/types'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  fullName: string
  phone?: string
  cityCode?: string
  role?: UserRole
}

export interface UpdateProfileInput {
  fullName: string
  phone?: string
  cityCode?: string
  avatarUrl?: string
}

export const authApi = {
  login: (input: LoginInput) => apiPost<Session>('/api/v1/auth/login', input),
  register: (input: RegisterInput) => apiPost<Session>('/api/v1/auth/register', input),
  me: () => apiGet<User>('/api/v1/auth/me'),
  updateProfile: (input: UpdateProfileInput) => apiPut<User>('/api/v1/auth/me', input),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiPut<void>('/api/v1/auth/me/password', { currentPassword, newPassword }),
}
