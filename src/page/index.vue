<script setup lang="ts">
import { ref} from 'vue'
import {useRouter} from "vue-router";
import {ElMessage, ElNotification} from "element-plus";

// 状态
const router = useRouter()

const activeMenu = ref('1')
const sidebarCollapsed = ref(false)
const role = ref('')

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
            <li v-for="item in menuItems" :key="item.name" class="mb-1">
              <router-link
                  :to="item.name"
                  :class="activeMenu === item.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'"
                  @click="activeMenu = item.name"
                  class="w-full flex items-center px-4 py-3 transition-all duration-200 no-underline"
              >
                <i :class="'fa '+item.icon + ' text-xl mr-3'" class="w-6 text-center"></i>
                <span :class="sidebarCollapsed ? 'hidden' : 'block'" class="font-medium">
                  {{ item.title }}
                </span>
              </router-link>
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
  </div>
</template>

<style scoped>
/* 自定义工具类 */
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
}
</style>
