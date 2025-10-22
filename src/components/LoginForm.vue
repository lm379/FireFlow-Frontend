<template>
  <div class="login-container">
    <!-- 左侧插画区域 -->
    <div class="login-illustration">
      <div class="brand-header">
        <div class="brand-logo">
          <div class="logo-icon">
            <img src="../assets/logo.svg" alt="FireFlow Logo" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          <span class="brand-name">FireFlow</span>
        </div>
      </div>
      
      <div class="illustration-content">
        <div class="welcome-text">
          <h2>欢迎使用服务器防火墙管理面板</h2>
        </div>
        
        <!-- 简化的插画元素 -->
        <div class="illustration-graphics">
          <div class="graphic-element dashboard">
            <div class="dashboard-header"></div>
            <div class="dashboard-content">
              <div class="chart-bars">
                <div class="bar" style="height: 60%"></div>
                <div class="bar" style="height: 80%"></div>
                <div class="bar" style="height: 45%"></div>
                <div class="bar" style="height: 90%"></div>
              </div>
              <div class="chart-pie"></div>
            </div>
          </div>
          
          <div class="graphic-element security">
            <div class="shield-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22S4 18 4 12V7L12 5L20 7V12C20 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div class="floating-elements">
            <div class="float-element" style="top: 20%; left: 10%; animation-delay: 0s;"></div>
            <div class="float-element" style="top: 60%; right: 15%; animation-delay: 1s;"></div>
            <div class="float-element" style="bottom: 30%; left: 20%; animation-delay: 2s;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-form-section">
      <div class="login-card">
        <div class="brand-text">
          <img src="../assets/logo.svg" alt="FireFlow Logo" />
          FireFlow
        </div>
        <div class="login-header">
          <h1>登录</h1>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username" class="form-item">
            <label class="form-label">用户名</label>
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              size="large"
              :disabled="loading"
              class="form-input"
            />
          </el-form-item>

          <el-form-item prop="password" class="form-item">
            <label class="form-label">密码</label>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              :disabled="loading"
              show-password
              class="form-input"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-button type="text" class="forgot-password" @click="handleForgotPassword">忘记密码</el-button>
          </div>

          <el-form-item class="form-submit">
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showChangePasswordDialog"
      title="修改密码"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form
        ref="changePasswordFormRef"
        :model="changePasswordForm"
        :rules="changePasswordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="changePasswordForm.oldPassword"
            type="password"
            show-password
            :disabled="changePasswordLoading"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="changePasswordForm.newPassword"
            type="password"
            show-password
            :disabled="changePasswordLoading"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="changePasswordForm.confirmPassword"
            type="password"
            show-password
            :disabled="changePasswordLoading"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button
          type="primary"
          :loading="changePasswordLoading"
          @click="handleChangePassword"
        >
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useLogin } from '../composables/useLogin'

const {
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
  handleForgotPassword,
} = useLogin()

// 组件挂载时恢复保存的登录信息
onMounted(() => {
  initLoginForm()
})
</script>

<style src="../styles/components/login.css" scoped></style>

