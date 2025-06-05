<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {sha256encrypt} from "../../lib/sha256encrypt.ts";

// 表单数据
const form = ref({
  name: '',
  age: 0,
  address: '',
  phone: '',
  email: '',
  avatar: '',
  password: '',
})

// 头像上传相关
const avatarPreview = ref<string | null>(null)
const avatarFile = ref<File | null>(null)

// 加载状态
const isLoading = ref(false)

// 错误信息
const errors = ref({
  name: '',
  age: '',
  email: '',
  phone: ''
})

const router = useRouter()

// 获取用户信息
onMounted(() => {
  fetchUserInfo()
})

const fetchUserInfo = async () => {
  try {
    isLoading.value = true
    const response = await fetch('/api/user/self',{
      method: 'GET',
      headers: {
        "Authorization": `${localStorage.getItem('token')}`,
      }
    })
    if (!response.ok) throw new Error('请求失败')

    const user = await response.json()
    // 填充表单数据
    form.value = {
      name: user.name as string || '',
      age: user.age as number,
      address: user.address as string || '',
      phone: user.phone as string || '',
      email: user.email as string || '',
      avatar: user.avatar as string || '',
      password: '',
    }

    // 设置头像预览
    avatarPreview.value = user.avatar
  } catch (error:any) {
    console.error('获取用户信息失败:', error)
    if (error.message.includes('401')) {
      router.push('/login')
    }
  } finally {
    isLoading.value = false
  }
}

// 表单验证
const validateForm = () => {
  const newErrors = {
    name: form.value.name.length < 2 ? '姓名至少2个字' : '',
    age: form.value.age && (form.value.age < 1 || form.value.age > 150) ? '年龄范围1-150' : '',
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) ? '请输入有效邮箱' : '',
    phone: !/^1[3-9]\d{9}$/.test(form.value.phone) ? '请输入有效手机号' : ''
  }

  errors.value = newErrors
  return Object.values(newErrors).every(err => !err)
}

// 处理头像上传
const handleAvatarUpload = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    avatarFile.value = input.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      avatarPreview.value = reader.result as string
    }
    reader.readAsDataURL(avatarFile.value)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true

    const requestData = {
      name: form.value.name,
      age: form.value.age || null,
      address: form.value.address || null,
      phone: form.value.phone || null,
      email: form.value.email || null,
      password: (form.value.password==''||form.value.password==null)?"":sha256encrypt(form.value.password),
      avatar: avatarFile?.value
    }

    const response = await fetch('/api/user/self', {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        "Authorization":localStorage.getItem('token')??'',
        "Content-Type": "application/json",
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login')
        return
      }
      throw new Error('修改失败，请重试')
    }
    alert('信息修改成功！')
    window.location.reload()
  } catch (error:any) {
    console.error('修改信息失败:', error)
    alert(error.message || '操作失败，请检查网络连接')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
        <i class="fa fa-user-circle mr-2"></i>个人信息管理
      </h2>

      <!-- 头像区域 -->
      <div class="flex justify-center mb-8">
        <div class="relative">
          <img :src="avatarPreview || 'https://picsum.photos/200/200?random=1'" alt="用户头像"
               class="w-32 h-32 rounded-full border-4 border-gray-200 object-cover">

          <div class="absolute bottom-0 right-0">
            <label for="avatar-upload" class="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full cursor-pointer">
              <i class="fa fa-camera"></i>
            </label>
            <input type="file" id="avatar-upload" accept="image/*"
                   @change="handleAvatarUpload" class="hidden">
          </div>
        </div>
      </div>

      <!-- 表单区域 -->
      <form class="space-y-6">
        <!-- 姓名 -->
        <div class="space-y-2">
          <label for="name" class="flex items-center text-sm font-medium text-gray-700">
            <i class="fa fa-user mr-2"></i>姓名
          </label>
          <input type="text" id="name" v-model="form.name"
                 class="w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                 placeholder="请输入姓名">
          <p class="text-red-500 text-sm">{{ errors.name }}</p>
        </div>

        <!-- 年龄 -->
        <div class="space-y-2">
          <label for="age" class="flex items-center text-sm font-medium text-gray-700">
            <i class="fa fa-birthday-cake mr-2"></i>年龄
          </label>
          <input type="number" id="age" v-model="form.age"
                 class="w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                 placeholder="请输入年龄">
          <p class="text-red-500 text-sm">{{ errors.age }}</p>
        </div>

        <!-- 邮箱 -->
        <div class="space-y-2">
          <label for="email" class="flex items-center text-sm font-medium text-gray-700">
            <i class="fa fa-envelope mr-2"></i>邮箱
          </label>
          <input type="email" id="email" v-model="form.email"
                 class="w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                 placeholder="请输入邮箱">
          <p class="text-red-500 text-sm">{{ errors.email }}</p>
        </div>

        <!-- 手机号 -->
        <div class="space-y-2">
          <label for="phone" class="flex items-center text-sm font-medium text-gray-700">
            <i class="fa fa-phone mr-2"></i>手机号
          </label>
          <input type="tel" id="phone" v-model="form.phone"
                 class="w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                 placeholder="请输入手机号">
          <p class="text-red-500 text-sm">{{ errors.phone }}</p>
        </div>

        <!-- 地址 -->
        <div class="space-y-2">
          <label for="address" class="flex items-center text-sm font-medium text-gray-700">
            <i class="fa fa-map-marker mr-2"></i>联系地址
          </label>
          <textarea id="address" v-model="form.address" rows="3"
                    class="w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="请输入联系地址"></textarea>
        </div>

        <!-- 密码修改 -->
        <div class="space-y-2">
          <label for="password" class="flex items-center text-sm font-medium text-gray-700">
            <i class="fa fa-lock mr-2"></i>修改密码（可选）
          </label>
          <input type="password" id="password" v-model="form.password"
                 class="w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                 placeholder="留空则不修改密码">
        </div>

        <!-- 提交按钮 -->
        <button @click="handleSubmit" :disabled="isLoading"
                class="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200">
          {{ isLoading ? '保存中...' : '保存修改' }}
          <i class="fa fa-save ml-2" v-show="!isLoading"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.avatar-placeholder {
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
