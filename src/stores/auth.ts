import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface User {
  id: number
  username: string
  is_first_login: boolean
  last_login_time?: string
  created_at: string
  updated_at: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 设置认证信息
  const setAuth = (authToken: string, userInfo: User) => {
    token.value = authToken
    user.value = userInfo
    
    // 保存到localStorage
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('user_info', JSON.stringify(userInfo))
  }

  // 清除认证信息
  const clearAuth = () => {
    token.value = ''
    user.value = null
    
    // 清除localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
  }

  // 从localStorage恢复认证信息
  const restoreAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user_info')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Failed to restore auth info:', error)
        clearAuth()
      }
    }
  }

  // 更新用户信息
  const updateUser = (userInfo: User) => {
    user.value = userInfo
    localStorage.setItem('user_info', JSON.stringify(userInfo))
  }

  // 检查令牌是否即将过期（预留5分钟）
  const isTokenExpiringSoon = (expiresAt: number) => {
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = expiresAt - now
    return timeLeft < 300 // 5分钟
  }

  return {
    token,
    user,
    isLoggedIn,
    setAuth,
    clearAuth,
    restoreAuth,
    updateUser,
    isTokenExpiringSoon
  }
})