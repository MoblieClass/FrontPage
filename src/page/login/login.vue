<script setup lang="ts">
import { ref } from 'vue'
import {sha256encrypt} from "../../lib/sha256encrypt.ts";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";

// 页面状态管理
const pages = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgotPassword'
}
const router = useRouter()
const currentPage = ref(pages.LOGIN)

// 表单数据
const form = ref({
  username: '',
  password: '',
  remember: false,
  email: '',
  confirmPassword: ''
})

// 表单验证状态
const validation = ref({
  username: '',
  password: '',
  email: '',
  confirmPassword: ''
})

// 登录处理函数
const handleLogin = () => {
  let isValid = true

  if (!form.value.username) {
    validation.value.username = '请输入用户名'
    isValid = false
  } else {
    validation.value.username = ''
  }

  if (!form.value.password) {
    validation.value.password = '请输入密码'
    isValid = false
  } else if (form.value.password.length < 6) {
    validation.value.password = '密码长度至少为6位'
    isValid = false
  } else {
    validation.value.password = ''
  }

  const login_callback = async () => {
    try{
      let result = await fetch("/api/auth/login",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          username: form.value.username,
          password: sha256encrypt(form.value.password),
        })
      });
      if(result.ok){
        ElMessage.success("登陆成功")
        localStorage.setItem("token",result.headers.get("Authorization")??"")
        router.push("/home")
      }else{
        let text = await result.text()
        ElMessage.error({
          message: text,
        })
      }
    }catch(error){
      ElMessage.error({
        message: "登陆失败"
      })
      console.log(error)
    }
  }

  if (isValid) {
    login_callback()
  }
}

// 注册处理函数
const handleRegister = () => {
  let isValid = true

  if (!form.value.username) {
    validation.value.username = '请输入用户名'
    isValid = false
  } else {
    validation.value.username = ''
  }

  if (!form.value.email) {
    validation.value.email = '请输入邮箱'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    validation.value.email = '请输入有效的邮箱地址'
    isValid = false
  } else {
    validation.value.email = ''
  }

  if (!form.value.password) {
    validation.value.password = '请输入密码'
    isValid = false
  } else if (form.value.password.length < 6) {
    validation.value.password = '密码长度至少为6位'
    isValid = false
  } else {
    validation.value.password = ''
  }

  if (form.value.password !== form.value.confirmPassword) {
    validation.value.confirmPassword = '两次输入的密码不一致'
    isValid = false
  } else {
    validation.value.confirmPassword = ''
  }

  const register_callback = async () => {
    try{
      let result = await fetch("/api/auth/register",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:JSON.stringify({
          username: form.value.username,
          password: sha256encrypt(form.value.password),
          email: form.value.email,
        })
      })
      if(result.ok){
        ElMessage.success({
          message:"注册成功，请返回登陆"
        })
        window.location.reload()
      }else{
        let text = await result.text()
        ElMessage.error({
          message: text==""?"注册失败":text,
        })
      }
    }catch(error){
      ElMessage.error({
        message:"注册失败"
      })
      console.log(error)
    }
  }

  if (isValid) {
    console.log('注册成功:', form.value)
    register_callback()
  }
}

// 忘记密码处理函数
const handleForgotPassword = () => {
  let isValid = true

  if (!form.value.email) {
    validation.value.email = '请输入邮箱'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    validation.value.email = '请输入有效的邮箱地址'
    isValid = false
  } else {
    validation.value.email = ''
  }

  if (isValid) {
    console.log('重置密码邮件已发送:', form.value.email)
    // 发送密码重置邮件

  }
}

// 处理回车键提交
const handleKeyPress = (e: KeyboardEvent, handler: () => void) => {
  if (e.key === 'Enter') {
    handler()
  }
}

// 页面切换函数
const goToLogin = () => {
  currentPage.value = pages.LOGIN
  resetValidation()
}

const goToRegister = () => {
  currentPage.value = pages.REGISTER
  resetValidation()
}

const goToForgotPassword = () => {
  currentPage.value = pages.FORGOT_PASSWORD
  resetValidation()
}

// 重置验证状态
const resetValidation = () => {
  validation.value = {
    username: '',
    password: '',
    email: '',
    confirmPassword: ''
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 p-4">
    <div class="w-full max-w-md">
      <!-- 登录页面 -->
      <div v-if="currentPage === 'login'" class="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl animate-fadeIn">
        <!-- 顶部装饰条 -->
        <div class="h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        <div class="p-8">
          <!-- 标题 -->
          <div class="text-center mb-8">
            <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-gray-800">欢迎登录</h1>
            <p class="text-gray-500 mt-2">请输入您的账号和密码</p>
          </div>

          <!-- 登录表单 -->
          <form class="space-y-6" @submit.prevent="handleLogin">
            <!-- 用户名 -->
            <div class="space-y-2 form-element-1">
              <label for="login-username" class="block text-sm font-medium text-gray-700">
                <i class="fa fa-user mr-2"></i>用户名
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fa fa-user text-gray-400"></i>
                </div>
                <input
                    type="text"
                    id="login-username"
                    v-model="form.username"
                    @keypress="handleKeyPress($event, handleLogin)"
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="请输入用户名"
                >
              </div>
              <p class="text-red-500 text-sm" v-if="validation.username">{{ validation.username }}</p>
            </div>

            <!-- 密码 -->
            <div class="space-y-2 form-element-2">
              <label for="login-password" class="block text-sm font-medium text-gray-700">
                <i class="fa fa-lock mr-2"></i>密码
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fa fa-lock text-gray-400"></i>
                </div>
                <input
                    type="password"
                    id="login-password"
                    v-model="form.password"
                    @keypress="handleKeyPress($event, handleLogin)"
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="请输入密码"
                >
              </div>
              <p class="text-red-500 text-sm" v-if="validation.password">{{ validation.password }}</p>
            </div>

            <!-- 记住我和忘记密码 -->
            <div class="flex items-center justify-between form-element-3">
              <div class="flex items-center">
                <input
                    id="remember-me"
                    type="checkbox"
                    v-model="form.remember"
                    class="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                >
                <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                  记住我
                </label>
              </div>
              <a href="#" @click.prevent="goToForgotPassword" class="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200">
                <i class="fa fa-question-circle mr-1"></i>忘记密码?
              </a>
            </div>

            <!-- 登录按钮 -->
            <button
                type="submit"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] form-element-4"
            >
              <i class="fa fa-sign-in mr-2"></i>登录
            </button>
          </form>

          <!-- 分隔线 -->
          <div class="my-6 flex items-center">
            <div class="flex-grow h-px bg-gray-300"></div>
            <span class="flex-shrink mx-4 text-gray-500">或者</span>
            <div class="flex-grow h-px bg-gray-300"></div>
          </div>

          <!-- 注册链接 -->
          <p class="text-center text-sm text-gray-700">
            还没有账号?
            <a href="#" @click.prevent="goToRegister" class="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
              <i class="fa fa-user-plus mr-1"></i>立即注册
            </a>
          </p>
        </div>
      </div>

      <!-- 注册页面 -->
      <div v-else-if="currentPage === 'register'" class="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl animate-fadeIn">
        <!-- 顶部装饰条 -->
        <div class="h-2 bg-gradient-to-r from-green-500 to-blue-600"></div>

        <div class="p-8">
          <!-- 标题 -->
          <div class="text-center mb-8">
            <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-gray-800">创建账号</h1>
            <p class="text-gray-500 mt-2">请填写以下信息注册新账号</p>
          </div>

          <!-- 注册表单 -->
          <form class="space-y-6" @submit.prevent="handleRegister">
            <!-- 用户名 -->
            <div class="space-y-2 form-element-1">
              <label for="register-username" class="block text-sm font-medium text-gray-700">
                <i class="fa fa-user mr-2"></i>用户名
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fa fa-user text-gray-400"></i>
                </div>
                <input
                    type="text"
                    id="register-username"
                    v-model="form.username"
                    @keypress="handleKeyPress($event, handleRegister)"
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="请输入用户名"
                >
              </div>
              <p class="text-red-500 text-sm" v-if="validation.username">{{ validation.username }}</p>
            </div>

            <!-- 邮箱 -->
            <div class="space-y-2 form-element-2">
              <label for="register-email" class="block text-sm font-medium text-gray-700">
                <i class="fa fa-envelope mr-2"></i>邮箱
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fa fa-envelope text-gray-400"></i>
                </div>
                <input
                    type="email"
                    id="register-email"
                    v-model="form.email"
                    @keypress="handleKeyPress($event, handleRegister)"
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="请输入邮箱"
                >
              </div>
              <p class="text-red-500 text-sm" v-if="validation.email">{{ validation.email }}</p>
            </div>

            <!-- 密码 -->
            <div class="space-y-2 form-element-3">
              <label for="register-password" class="block text-sm font-medium text-gray-700">
                <i class="fa fa-lock mr-2"></i>密码
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fa fa-lock text-gray-400"></i>
                </div>
                <input
                    type="password"
                    id="register-password"
                    v-model="form.password"
                    @keypress="handleKeyPress($event, handleRegister)"
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="请输入密码"
                >
              </div>
              <p class="text-red-500 text-sm" v-if="validation.password">{{ validation.password }}</p>
            </div>

            <!-- 确认密码 -->
            <div class="space-y-2 form-element-4">
              <label for="register-confirm-password" class="block text-sm font-medium text-gray-700">
                <i class="fa fa-lock mr-2"></i>确认密码
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fa fa-lock text-gray-400"></i>
                </div>
                <input
                    type="password"
                    id="register-confirm-password"
                    v-model="form.confirmPassword"
                    @keypress="handleKeyPress($event, handleRegister)"
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    placeholder="请再次输入密码"
                >
              </div>
              <p class="text-red-500 text-sm" v-if="validation.confirmPassword">{{ validation.confirmPassword }}</p>
            </div>

            <!-- 注册按钮 -->
            <button
                type="submit"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <i class="fa fa-user-plus mr-2"></i>注册账号
            </button>
          </form>

          <!-- 已有账号提示 -->
          <p class="text-center text-sm text-gray-700 mt-6">
            已有账号?
            <a href="#" @click.prevent="goToLogin" class="font-medium text-green-600 hover:text-green-700 transition-colors duration-200">
              <i class="fa fa-sign-in mr-1"></i>立即登录
            </a>
          </p>
        </div>
      </div>

      <!-- 忘记密码页面 -->
      <div v-else-if="currentPage === 'forgotPassword'" class="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl animate-fadeIn">
        <!-- 顶部装饰条 -->
        <div class="h-2 bg-gradient-to-r from-yellow-500 to-orange-600"></div>

        <div class="p-8">
          <!-- 标题 -->
          <div class="text-center mb-8">
            <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-gray-800">找回密码</h1>
            <p class="text-gray-500 mt-2">请输入注册邮箱以重置密码</p>
          </div>

          <!-- 找回密码表单 -->
          <form class="space-y-6" @submit.prevent="handleForgotPassword">
            <!-- 邮箱 -->
            <div class="space-y-2 form-element-1">
              <label for="forgot-email" class="block text-sm font-medium text-gray-700">
                <i class="fa fa-envelope mr-2"></i>邮箱
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fa fa-envelope text-gray-400"></i>
                </div>
                <input
                    type="email"
                    id="forgot-email"
                    v-model="form.email"
                    @keypress="handleKeyPress($event, handleForgotPassword)"
                    class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"
                    placeholder="请输入注册邮箱"
                >
              </div>
              <p class="text-red-500 text-sm" v-if="validation.email">{{ validation.email }}</p>
            </div>

            <!-- 提交按钮 -->
            <button
                type="submit"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <i class="fa fa-paper-plane mr-2"></i>发送重置邮件
            </button>
          </form>

          <!-- 返回登录提示 -->
          <p class="text-center text-sm text-gray-700 mt-6">
            想起密码了?
            <a href="#" @click.prevent="goToLogin" class="font-medium text-yellow-600 hover:text-yellow-700 transition-colors duration-200">
              <i class="fa fa-arrow-left mr-1"></i>返回登录
            </a>
          </p>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <p class="mt-6 text-center text-sm text-gray-500">
        &copy; 2025 移动互动课堂 版权所有
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}

/* 为表单元素添加延迟动画 */
.form-element-1 {
  animation: fadeIn 0.5s ease-out forwards 0.1s;
  opacity: 0;
}

.form-element-2 {
  animation: fadeIn 0.5s ease-out forwards 0.2s;
  opacity: 0;
}

.form-element-3 {
  animation: fadeIn 0.5s ease-out forwards 0.3s;
  opacity: 0;
}

.form-element-4 {
  animation: fadeIn 0.5s ease-out forwards 0.4s;
  opacity: 0;
}
</style>
