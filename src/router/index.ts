import { createRouter, createWebHashHistory } from 'vue-router'
import FirewallRules from '../components/FirewallRules.vue'
import CloudConfig from '../components/CloudConfig.vue'
import SystemSettings from '../components/SystemSettings.vue'
import LoginForm from '../components/LoginForm.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginForm,
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    redirect: '/rules'
  },
  {
    path: '/rules',
    name: 'rules',
    component: FirewallRules,
    meta: {
      title: '防火墙规则',
      requiresAuth: true
    }
  },
  {
    path: '/cloud-config',
    name: 'cloud-config',
    component: CloudConfig,
    meta: {
      title: '云服务配置',
      requiresAuth: true
    }
  },
  {
    path: '/system',
    name: 'system',
    component: SystemSettings,
    meta: {
      title: '系统设置',
      requiresAuth: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/rules'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('auth_token')
  const isAuthenticated = !!token
  
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - FireFlow`
  }
  
  // 如果路由需要认证但用户未登录，跳转到登录页
  if (to.meta?.requiresAuth !== false && !isAuthenticated) {
    next('/login')
    return
  }
  
  // 如果用户已登录且访问登录页，跳转到首页
  if (to.name === 'login' && isAuthenticated) {
    next('/')
    return
  }
  
  next()
})

export default router