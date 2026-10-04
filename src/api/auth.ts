import { apiClient } from './index'

import type { ApiResponse } from './index'
import type { User } from '../stores/auth'
export type { ApiResponse } from './index'

export interface LoginData {
  token: string
  user: User
  is_first_login: boolean
  expires_at: number
}

export type LoginResponse = ApiResponse<LoginData>

// 登录
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', {
    username,
    password
  })
  return response.data
}

// 修改密码
export const changePassword = async (oldPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword
  })
  return response.data
}

// 验证令牌
export const verifyToken = async (token?: string): Promise<ApiResponse<{valid: boolean, user?: User}>> => {
  const url = token ? `/auth/verify?token=${encodeURIComponent(token)}` : '/auth/verify'
  const response = await apiClient.get(url)
  return response.data
}

// 获取当前用户信息
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get('/auth/me')
  return response.data
}

// 检查首次登录状态
export const checkFirstLogin = async (): Promise<ApiResponse<{is_first_login: boolean}>> => {
  const response = await apiClient.get('/auth/first-login')
  return response.data
}

// 退出登录
export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.post('/auth/logout')
  return response.data
}

// 刷新令牌
export const refreshToken = async (): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/refresh')
  return response.data
}