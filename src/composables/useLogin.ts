import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { login, changePassword } from '../api/auth'
import { useAuthStore } from '../stores/auth'

// 登录表单接口
export interface LoginFormData {
  username: string
  password: string
}

// 修改密码表单接口
export interface ChangePasswordFormData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

// 使用登录功能的组合式函数
export function useLogin() {
  const router = useRouter()
  const authStore = useAuthStore()

  // 表单引用
  const loginFormRef = ref<FormInstance>()
  const changePasswordFormRef = ref<FormInstance>()
  
  // 加载状态
  const loading = ref(false)
  const changePasswordLoading = ref(false)
  const showChangePasswordDialog = ref(false)

  // 登录表单数据
  const loginForm = reactive<LoginFormData>({
    username: 'admin',
    password: ''
  })

  // 记住我选项
  const rememberMe = ref(false)

  // 初始化时恢复保存的登录信息
  const initLoginForm = () => {
    try {
      const savedUsername = localStorage.getItem('remembered_username')
      const savedPassword = localStorage.getItem('remembered_password')
      
      if (savedUsername && savedPassword) {
        loginForm.username = savedUsername
        loginForm.password = savedPassword
        rememberMe.value = true
      }
    } catch (error) {
      console.warn('Failed to restore login info:', error)
    }
  }

  // 保存登录信息
  const saveLoginInfo = () => {
    if (rememberMe.value) {
      localStorage.setItem('remembered_username', loginForm.username)
      localStorage.setItem('remembered_password', loginForm.password)
    } else {
      // 清除保存的信息
      localStorage.removeItem('remembered_username')
      localStorage.removeItem('remembered_password')
    }
  }

  // 修改密码表单数据
  const changePasswordForm = reactive<ChangePasswordFormData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // 登录表单验证规则
  const loginRules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' }
    ]
  }

  // 修改密码表单验证规则
  const changePasswordRules: FormRules = {
    oldPassword: [
      { required: true, message: '请输入原密码', trigger: 'blur' }
    ],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少6位', trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: '请确认新密码', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          if (value !== changePasswordForm.newPassword) {
            callback(new Error('两次输入的密码不一致'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }

  // 处理登录
  const handleLogin = async () => {
    if (!loginFormRef.value) return
    
    try {
      await loginFormRef.value.validate()
      loading.value = true
      
      const response = await login(loginForm.username, loginForm.password)
      
      if (response.success) {
        const { token, user, is_first_login } = response.data
        
        ElMessage.success('登录成功')
        
        // 保存认证信息
        authStore.setAuth(token, user)
        
        // 保存登录信息
        saveLoginInfo()
        
        // 如果是首次登录，强制修改密码
        if (is_first_login) {
          showChangePasswordDialog.value = true
          changePasswordForm.oldPassword = loginForm.password
          // 不跳转到首页，停留在登录页面进行密码修改
        } else {
          router.push('/')
        }
      } else {
        // 显示服务器返回的具体错误信息
        ElMessage.error(response.message || '登录失败')
      }
    } catch (error: any) {
      console.error('登录错误:', error)
      
      // 处理网络错误和HTTP错误
      if (error.response) {
        // 服务器返回了错误状态码
        const status = error.response.status
        const data = error.response.data
        
        if (status === 401) {
          ElMessage.error(data.message || '用户名或密码错误')
        } else if (status === 400) {
          ElMessage.error(data.message || '请求参数错误')
        } else if (status === 500) {
          ElMessage.error('服务器内部错误，请稍后重试')
        } else {
          ElMessage.error(data.message || `登录失败 (${status})`)
        }
      } else if (error.request) {
        // 网络错误
        ElMessage.error('网络连接失败，请检查网络设置')
      } else {
        // 其他错误
        ElMessage.error(error.message || '登录失败，请重试')
      }
    } finally {
      loading.value = false
    }
  }

  // 处理修改密码
  const handleChangePassword = async () => {
    if (!changePasswordFormRef.value) return
    
    try {
      await changePasswordFormRef.value.validate()
      changePasswordLoading.value = true
      
      const response = await changePassword(
        changePasswordForm.oldPassword, 
        changePasswordForm.newPassword
      )
      
      if (response.success) {
        ElMessage.success('密码修改成功，请重新登录')
        showChangePasswordDialog.value = false
        
        // 立即清除认证信息，使旧令牌失效
        authStore.clearAuth()
        
        // 清空登录表单，为重新登录做准备
        loginForm.username = 'admin'
        loginForm.password = ''
        rememberMe.value = false
        
        // 清除保存的登录信息
        localStorage.removeItem('remembered_username')
        localStorage.removeItem('remembered_password')
        
        // 立即重定向到登录页面
        router.push('/login')
      } else {
        ElMessage.error(response.message || '密码修改失败')
      }
    } catch (error: any) {
      console.error('修改密码错误:', error)
      
      // 处理网络错误和HTTP错误
      if (error.response) {
        const status = error.response.status
        const data = error.response.data
        
        if (status === 400) {
          ElMessage.error(data.message || '原密码不正确或新密码格式错误')
        } else if (status === 401) {
          ElMessage.error('身份验证失败，请重新登录')
        } else if (status === 500) {
          ElMessage.error('服务器内部错误，请稍后重试')
        } else {
          ElMessage.error(data.message || `修改密码失败 (${status})`)
        }
      } else if (error.request) {
        ElMessage.error('网络连接失败，请检查网络设置')
      } else {
        ElMessage.error(error.message || '密码修改失败，请重试')
      }
    } finally {
      changePasswordLoading.value = false
    }
  }

  return {
    // 响应式数据
    loginFormRef,
    changePasswordFormRef,
    loading,
    changePasswordLoading,
    showChangePasswordDialog,
    loginForm,
    changePasswordForm,
    loginRules,
    changePasswordRules,
    rememberMe,
    
    // 方法
    handleLogin,
    handleChangePassword,
    initLoginForm,
  }
}