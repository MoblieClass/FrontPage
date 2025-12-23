<script setup lang="ts">
import { ref} from 'vue'
import {useRouter} from "vue-router";
import {ElMessage, ElNotification} from "element-plus";

// 状态
const router = useRouter()

const sidebarCollapsed = ref(false)
const role = ref('')
const showIframe = ref(false)
const iframeUrl = ref('')
const iframeError = ref(false)

const openInIframe = (url: string) => {
  iframeUrl.value = url
  iframeError.value = false
  showIframe.value = true
}

const closeIframe = () => {
  showIframe.value = false
  iframeUrl.value = ''
  iframeError.value = false
}

const handleIframeError = () => {
  iframeError.value = true
}

const openInNewWindow = () => {
  window.open(iframeUrl.value, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
  closeIframe()
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const menuItems = [
  { name: '/home', title: '仪表盘', icon: 'fa-laptop' },
  { name: '/user', title: '用户管理', icon: 'fa-users' },
  { name: '/reward', title: '悬赏管理', icon: 'fa-trophy' },
  { name: '/permission', title: '权限管理', icon: 'fa-cogs' },
  { name: '/classall', title: '课堂管理(教师)', icon: 'fa-chalkboard-teacher' },
  { name: '/class', title: '我的课程(学生)', icon: 'fa-book' },
  {name: '/llj', title: 'LLJ 系统', icon: 'fa-cogs'}
]

interface UserInfo{
  username: string
  name: string
  age: number
  address: string
  phone: string
  email: string
  avatar: string
}
const self_info = ref<UserInfo>()
const exitLogin = ()=>{
  localStorage.removeItem('token')
  router.push('/login')
}
const self_info_callback = async () => {
  try{
    let result = await fetch("/api/user/self",{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token")??""
      },
    })
    if(result.status === 200){
      self_info.value = await result.json() as UserInfo
      localStorage.setItem('username', self_info.value.username)
      ElNotification({
        title: '欢迎您！',
        message: `${self_info.value.name}，欢迎回来`,
      })
    }else{
      router.push("/login")
      return
    }
  }catch(error){
    ElMessage.error({
      message: "获取个人信息失败，正在跳转登陆页",
    })
    router.push("/login")
    return
  }

  try{
    let result = await fetch(`/api/user/roles?username=${self_info.value.username}`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": localStorage.getItem("token")??""
      },
    })
    if(result.status === 200){
      let roles = await result.json()
      for(let roleValue of roles){
        role.value += roleValue.description
      }
    }else{
      ElMessage.error({
        message:"无法获取用户角色"
      })
    }
  }catch(error){
    ElMessage.error({
      message: "获取用户角色失败",
    })
  }
}
self_info_callback()

</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button @click="toggleSidebar" class="text-white hover:text-gray-200 transition-colors duration-300">
            <i class="fa fa-bars text-xl"></i>
          </button>
          <h1 class="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-white tracking-tight">
            <i class="fa fa-mobile-alt mr-2"></i>Mobile class - 移动互动课堂
          </h1>
        </div>
        <div class="flex items-center space-x-6">
          <div class="relative">
            <input type="text" placeholder="搜索..." class="pl-10 pr-4 py-2 rounded-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 w-48 focus:w-64">
            <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70"></i>
          </div>
          <div class="flex items-center space-x-2 text-white">
            <i class="fa fa-bell-o text-xl hover:text-yellow-300 transition-colors duration-300"></i>
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <i class="fa fa-user-o"></i>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="flex flex-1 overflow-auto">
      <!-- 侧边栏 -->
      <aside
          :class="sidebarCollapsed ? 'w-20' : 'w-64'"
          class="bg-white shadow-lg z-20 transition-all duration-300 overflow-hidden flex flex-col"
      >
        <div class="p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <i class="fa fa-graduation-cap text-white"></i>
            </div>
            <h2
                :class="sidebarCollapsed ? 'hidden' : 'block'"
                class="text-lg font-semibold text-gray-800"
            >
              管理系统
            </h2>
          </div>
          <div
              :class="sidebarCollapsed ? 'block' : 'hidden'"
              class="text-gray-500 hover:text-gray-700"
          >
            <i class="fa fa-chevron-left"></i>
          </div>
        </div>

        <nav class="flex-1 py-4 overflow-y-auto">
          <ul>
            <!-- 主要功能模块 -->
            <li v-for="item in menuItems.slice(0, 6)" :key="item.name" class="mb-1">
              <router-link
                  :to="item.name"
                  :class="$route.path === item.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'"
                  class="w-full flex items-center px-4 py-3 transition-all duration-200 no-underline"
              >
                <i :class="'fa '+item.icon + ' text-xl mr-3'" class="w-6 text-center"></i>
                <span :class="sidebarCollapsed ? 'hidden' : 'block'" class="font-medium">
                  {{ item.title }}
                </span>
              </router-link>
            </li>
            
            <!-- LLJ 系统分组 -->
            <li :class="sidebarCollapsed ? 'hidden' : 'block'" class="px-4 py-2 mt-4 mb-2">
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                LLJ 系统
              </div>
            </li>
            <li v-for="item in menuItems.slice(6)" :key="item.name" class="mb-1">
              <button
                  :to="item.name"
                  :class="$route.path === item.name ? 'bg-purple-50 text-purple-600' : 'text-gray-700 hover:bg-purple-50'"
                  class="w-full flex items-center px-4 py-3 transition-all duration-200 no-underline"
                  @click="() => {
                    openInIframe('http://scustu.cn:9999')
                  }"
                  >
                <i :class="'fa '+item.icon + ' text-xl mr-3'" class="w-6 text-center"></i>
                <span :class="sidebarCollapsed ? 'hidden' : 'block'" class="font-medium">
                  {{ item.title }}
                </span>
              </button>
            </li>
          </ul>
        </nav>

        <div class="p-4 border-t border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <img :src="self_info?.avatar??'https://picsum.photos/200/200?random=1'" alt="用户头像" class="w-full h-full object-cover">
            </div>
            <div :class="sidebarCollapsed ? 'hidden' : 'block'">
              <p class="text-sm font-medium text-gray-800">{{self_info?.name}}</p>
              <p class="text-xs text-gray-500">{{role}}</p>
            </div>
          </div>
          <div class="flex items-center space-x-3 border-gray-200">
            <el-button type="danger" @click="exitLogin">退出登陆</el-button>
            <el-button type="primary" @click="router.push('/self_info')">修改信息</el-button>
          </div>
        </div>
      </aside>

      <!-- 内容区 -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6" style="height: calc(100vh - 140px);">
        <router-view />
      </main>
    </div>

    <!-- iframe 模态框 -->
    <div v-if="showIframe" class="iframe-modal-overlay" @click="closeIframe">
      <div class="iframe-modal-container" @click.stop>
        <div class="iframe-modal-header">
          <h3 class="iframe-modal-title">LLJ 系统</h3>
          <div class="iframe-header-actions">
            <button @click="handleIframeError" class="iframe-action-btn" title="加载失败？点击获取替代方案">
              <i class="fa fa-exclamation-triangle"></i>
            </button>
            <button @click="closeIframe" class="iframe-close-btn">
              <i class="fa fa-times"></i>
            </button>
          </div>
        </div>
        <div class="iframe-modal-body">
          <div v-if="iframeError" class="iframe-error-container">
            <div class="iframe-error-content">
              <i class="fa fa-exclamation-triangle iframe-error-icon"></i>
              <h3 class="iframe-error-title">无法在框架中加载此页面</h3>
              <p class="iframe-error-message">
                目标网站设置了安全策略，禁止在 iframe 中显示内容。
                <br>
                您可以选择在新窗口中打开该页面。
              </p>
              <div class="iframe-error-actions">
                <button @click="openInNewWindow" class="btn btn-primary">
                  <i class="fa fa-external-link-alt"></i>
                  在新窗口中打开
                </button>
                <button @click="closeIframe" class="btn btn-secondary">
                  <i class="fa fa-times"></i>
                  关闭
                </button>
              </div>
            </div>
          </div>
          <iframe 
            v-else
            :src="iframeUrl" 
            class="iframe-content"
            frameborder="0"
            allowfullscreen
            @error="handleIframeError"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义工具类 */
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
}

/* iframe 模态框样式 */
.iframe-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.iframe-modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90vw;
  height: 85vh;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.iframe-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.iframe-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.iframe-header-actions {
  display: flex;
  gap: 0.5rem;
}

.iframe-action-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  opacity: 0.8;
}

.iframe-action-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  opacity: 1;
}

.iframe-close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.iframe-close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.iframe-modal-body {
  flex: 1;
  overflow: hidden;
}

.iframe-content {
  width: 100%;
  height: 100%;
  border: none;
}

/* iframe 错误状态样式 */
.iframe-error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f8f9fa;
}

.iframe-error-content {
  text-align: center;
  padding: 2rem;
  max-width: 500px;
}

.iframe-error-icon {
  font-size: 4rem;
  color: #ffc107;
  margin-bottom: 1rem;
}

.iframe-error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.iframe-error-message {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.iframe-error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .iframe-modal-container {
    width: 95vw;
    height: 90vh;
    margin: 2.5vh 2.5vw;
  }
  
  .iframe-modal-header {
    padding: 0.75rem 1rem;
  }
  
  .iframe-modal-title {
    font-size: 1.1rem;
  }
}
</style>
