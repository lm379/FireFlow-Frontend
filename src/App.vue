<template>
  <!-- 如果是登录页面，只显示路由内容 -->
  <div v-if="isLoginPage">
    <router-view />
  </div>
  
  <!-- 否则显示完整布局 -->
  <el-container v-else style="height: 100vh;">
    <el-aside :width="isCollapse ? '64px' : '200px'" style="background-color: #545c64; transition: width 0.3s; position: relative;">
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#409EFF"
        :collapse="isCollapse">
        <div class="sidebar-header">
          <h3 v-if="!isCollapse">FireFlow</h3>
          <el-icon v-else style="color: white; font-size: 24px;">
            <Menu />
          </el-icon>
        </div>
        <el-menu-item index="/rules">
          <el-icon><List /></el-icon>
          <template #title>防火墙规则</template>
        </el-menu-item>
        <el-menu-item index="/cloud-config">
          <el-icon><Cloudy /></el-icon>
          <template #title>云服务配置</template>
        </el-menu-item>
        <el-menu-item index="/system">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
        <el-menu-item index="github">
          <el-icon><Link /></el-icon>
          <template #title>GitHub 地址</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="text-align: right; font-size: 12px; border-bottom: 1px solid #e6e6e6;">
        <div class="toolbar">
          <el-button 
            type="text" 
            @click="toggleCollapse"
            style="color: #409EFF;">
            <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <span class="page-title">{{ currentPageTitle }}</span>
          <div style="margin-left: auto; display: flex; align-items: center; gap: 16px;">
            <el-dropdown @command="handleUserMenuCommand">
              <span class="el-dropdown-link" style="color: #409EFF; cursor: pointer;">
                {{ authStore.user?.username || 'Admin' }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="change-password">修改密码</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showChangePasswordDialog"
      title="修改密码"
      width="400px"
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
        <el-button @click="showChangePasswordDialog = false" :disabled="changePasswordLoading">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="changePasswordLoading"
          @click="handleChangePassword"
        >
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus';
import { Menu, List, Cloudy, Setting, Fold, Expand, Link, ArrowDown } from '@element-plus/icons-vue';
import { useAuthStore } from './stores/auth';
import { changePassword, logout } from './api/auth';
import './styles/app.css';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const activeMenu = ref('/rules');
const isCollapse = ref(false);
const showChangePasswordDialog = ref(false);
const changePasswordLoading = ref(false);
const changePasswordFormRef = ref<FormInstance>();

// 修改密码表单
const changePasswordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

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
};

// 检查是否为登录页面
const isLoginPage = computed(() => {
  return route.path === '/login'
});

const currentPageTitle = computed(() => {
  return route.meta?.title as string || '防火墙规则';
});

// 监听路由变化，更新活动菜单
watch(() => route.path, (newPath) => {
  activeMenu.value = newPath;
}, { immediate: true });

// 初始化时恢复认证状态
onMounted(() => {
  authStore.restoreAuth();
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

const handleMenuSelect = (index: string) => {
  if (index === 'github') {
    // 打开GitHub链接，但不改变当前页面
    window.open('https://github.com/lm379/fireflow', '_blank', 'noopener,noreferrer');
    return;
  }
  router.push(index);
};

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 处理用户菜单命令
const handleUserMenuCommand = async (command: string) => {
  switch (command) {
    case 'change-password':
      showChangePasswordDialog.value = true;
      // 重置表单
      changePasswordForm.oldPassword = '';
      changePasswordForm.newPassword = '';
      changePasswordForm.confirmPassword = '';
      break;
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        // 调用后端登出接口
        await logout();
        
        // 清除本地认证信息
        authStore.clearAuth();
        
        ElMessage.success('已退出登录');
        router.push('/login');
      } catch (error) {
        // 用户取消或其他错误
        if (error !== 'cancel') {
          ElMessage.error('退出登录失败');
        }
      }
      break;
  }
};

// 处理修改密码
const handleChangePassword = async () => {
  if (!changePasswordFormRef.value) return;
  
  try {
    await changePasswordFormRef.value.validate();
    changePasswordLoading.value = true;
    
    const response = await changePassword(
      changePasswordForm.oldPassword,
      changePasswordForm.newPassword
    );
    
    if (response.success) {
      ElMessage.success('密码修改成功，请重新登录');
      showChangePasswordDialog.value = false;
      
      // 重置表单
      changePasswordForm.oldPassword = '';
      changePasswordForm.newPassword = '';
      changePasswordForm.confirmPassword = '';
      
      // 清除认证信息并跳转到登录页面
      authStore.clearAuth();
      router.push('/login');
    } else {
      ElMessage.error(response.message || '密码修改失败');
    }
  } catch (error: any) {
    ElMessage.error(error.message || '密码修改失败');
  } finally {
    changePasswordLoading.value = false;
  }
};

// 响应式设计：屏幕宽度小于768px时自动收起侧边栏
const checkScreenSize = () => {
  if (window.innerWidth < 768) {
    isCollapse.value = true;
  } else {
    isCollapse.value = false;
  }
};

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>
