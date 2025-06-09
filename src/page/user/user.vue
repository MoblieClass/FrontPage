<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <i class="fa fa-users mr-2"></i>
        用户管理
      </h1>

      <!-- 错误提示 -->
      <div
          v-if="errorMessage"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
      >
        {{ errorMessage }}
      </div>

      <!-- 搜索栏 -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input
                type="text"
                v-model="searchName"
                placeholder="搜索用户名..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <!-- 添加用户按钮 -->
        <button
            @click="resetForm"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <i class="fa fa-user-plus mr-2"></i>
          添加用户
        </button>
      </div>

      <!-- 表单区域 -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6 transition-all duration-300 transform hover:shadow-lg">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <i class="fa fa-user-circle mr-2"></i>
          {{ editing ? '编辑用户' : '添加用户' }}
        </h3>

        <form class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 用户名 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                用户名 <span class="text-red-500">*</span>
              </label>
              <input
                  type="text"
                  v-model="form.username"
                  :disabled="!!editing"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入用户名"
              >
            </div>

            <!-- 邮箱 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                邮箱 <span class="text-red-500">*</span>
              </label>
              <input
                  type="email"
                  v-model="form.email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入邮箱"
              >
            </div>

            <!-- 角色分配 -->
            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">
                分配角色
              </label>
              <div class="relative">
                <select
                    v-model="assignedRoles"
                    multiple
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="选择角色"
                >
                  <option
                      v-for="role in roles"
                      :key="role.name"
                      :value="role.name"
                  >
                    {{ role.name }} - {{ role.description || '无描述' }}
                  </option>
                </select>
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <i class="fa fa-bars"></i>
                </div>
              </div>
              <p class="text-sm text-gray-500">按住 Ctrl 键可选择多个角色</p>
            </div>

            <!-- 密码 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                密码
                <span v-if="editing" class="text-gray-400">(留空不修改)</span>
                <span v-else class="text-red-500">*</span>
              </label>
              <input
                  type="password"
                  v-model="form.password"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <!-- 姓名 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <input
                  type="text"
                  v-model="form.name"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入姓名"
              >
            </div>

            <!-- 年龄 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                年龄
              </label>
              <input
                  type="number"
                  v-model="form.age"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <!-- 手机号 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                手机号
              </label>
              <input
                  type="tel"
                  v-model="form.phone"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入手机号"
              >
            </div>
          </div>

          <!-- 地址 -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">
              地址
            </label>
            <textarea
                v-model="form.address"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="请输入地址"
            ></textarea>
          </div>

          <!-- 操作按钮 -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
                @click="resetForm"
                class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
            <button
                @click="handleSubmit"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <i class="fa fa-save mr-2"></i>
              {{ editing ? '保存修改' : '添加用户' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 用户列表 -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
            <tr class="bg-gray-50">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用户名
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                昵称
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                邮箱
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr
                v-for="user in users"
                :key="user.id"
                class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-gray-500 font-medium">
                        {{ user.username.charAt(0).toUpperCase() }}
                      </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.username }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ user.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ user.email }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                    @click="handleEdit(user)"
                    class="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                >
                  <i class="fa fa-pencil mr-1"></i>
                  编辑
                </button>
                <button
                    @click="handleDelete(user.username)"
                    class="text-red-600 hover:text-red-900 transition-colors"
                >
                  <i class="fa fa-trash mr-1"></i>
                  删除
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
                :disabled="page === 1"
                @click="page -= 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              上一页
            </button>
            <button
                :disabled="page * pageSize >= total"
                @click="page += 1"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                显示第 <span class="font-medium">
                  {{ (page - 1) * pageSize + 1 }}
                </span> 到
                <span class="font-medium">
                  {{ Math.min(page * pageSize, total) }}
                </span> 条，
                共 <span class="font-medium">{{ total }}</span> 条记录
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                    @click="handleExport"
                    class="ml-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <i class="fa fa-download mr-2"></i>
                  导出用户数据
                </button>
                <button
                    :disabled="page === 1"
                    @click="page -= 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">上一页</span>
                  <i class="fa fa-chevron-left h-5 w-5"></i>
                </button>

                <button
                    v-for="p in Math.ceil(total / pageSize)"
                    :key="p"
                    :class="{
                    'bg-blue-50 border-blue-500 text-blue-600': p === page,
                    'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': p !== page
                  }"
                    @click="page = p"
                    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  {{ p }}
                </button>

                <button
                    :disabled="page * pageSize >= total"
                    @click="page += 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span class="sr-only">下一页</span>
                  <i class="fa fa-chevron-right h-5 w-5"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

// 角色相关状态
const roles = ref<{ name: string; description: string }[]>([])
const assignedRoles = ref<string[]>([])

// 表格数据
const users = ref<{
  id: number
  username: string
  name: string | null
  age: number | null
  address: string | null
  phone: string | null
  email: string
  roles: { name: string; description: string }[]
  loadingRoles: boolean
}[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchName = ref('')
const isLoading = ref(false)

// 表单数据
const form = ref<{
  username: string
  name: string | null
  age: number | null
  address: string | null
  phone: string | null
  password: string
  email: string
}>({
  username: '',
  name: null,
  age: null,
  address: null,
  phone: null,
  password: '',
  email: ''
})

// 编辑状态
const editing = ref<null | {
  username: string
  name: string | null
  age: number | null
  address: string | null
  phone: string | null
  email: string
  roles: string[]
}>(null)
const errorMessage = ref('')

// 路由
const router = useRouter()

// 获取角色列表
const fetchRoles = async () => {
  try {
    const response = await fetch('/api/roles', {
      headers: {
        Authorization: `${localStorage.getItem('token') || ''}`
      }
    })
    if (!response.ok) throw new Error('获取角色失败')
    roles.value = await response.json()
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error(error)
  }
}

// 获取用户角色
const fetchUserRoles = async (username: string) => {
  try {
    const user = users.value.find(u => u.username === username)
    if (!user) return []

    user.loadingRoles = true

    const response = await fetch(`/api/user/roles?username=${username}`, {
      headers: {
        Authorization: `${localStorage.getItem('token') || ''}`
      }
    })

    if (!response.ok) throw new Error('获取用户角色失败')

    const userRoles = await response.json()
    user.roles = userRoles
    return userRoles
  } catch (error) {
    ElMessage.error('获取用户角色失败')
    console.error(error)
    return []
  } finally {
    const user = users.value.find(u => u.username)
    if (user) user.loadingRoles = false
  }
}

// 获取用户列表
const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await fetch(
        `/api/user/all?name=${searchName.value}&page=${page.value - 1}&size=${pageSize.value}`,
        {
          headers: {
            Authorization: `${localStorage.getItem('token') || ''}`
          }
        }
    )

    if (!response.ok) {
      if (response.status === 401) {
        router.push('/login')
        return
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    users.value = data.map((user: any) => ({
      ...user,
      roles: [], // 初始为空数组
      loadingRoles: false
    }))
    total.value = data.length
  } catch (error: any) {
    errorMessage.value = error.message || '获取用户列表失败'
    console.error('获取用户列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 提交表单（添加/更新用户）
const handleSubmit = async () => {
  // 处理角色分配逻辑
  if (editing.value) {
    const addedRoles = assignedRoles.value.filter(role => !editing.value!.roles.includes(role))
    // 批量解绑移除角色
    await fetch(`/api/roles/bind?username=${editing.value!.username}`, {
      method: 'DELETE',
      headers: {
        Authorization: `${localStorage.getItem('token') || ''}`
      }
    })

    // 批量绑定新增角色
    if (addedRoles.length > 0) {
      await Promise.all(addedRoles.map(role =>
          fetch(`/api/roles/bind?username=${editing.value!.username}&roleName=${role}`, {
            method: 'POST',
            headers: {
              Authorization: `${localStorage.getItem('token') || ''}`
            }
          })
      ))
    }
  } else {
    // 新增用户时绑定角色
    if (assignedRoles.value.length > 0) {
      await Promise.all(assignedRoles.value.map(role =>
          fetch(`/api/roles/bind?username=${form.value.username}&roleName=${role}`, {
            method: 'POST',
            headers: {
              Authorization: `${localStorage.getItem('token') || ''}`
            }
          })
      ))
    }
  }


  try {
    const requestData = {
      ...form.value,
      // 注意：这里不传递roles字段，角色通过单独接口处理
    }

    const response = editing.value ?
        await fetch(`/api/user/${editing.value.username}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify(requestData)
        }) :
        await fetch('/api/user/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify(requestData)
        })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '操作失败')
    }

    ElMessage.success(editing.value ? '用户更新成功' : '用户添加成功')
    fetchUsers()
    resetForm()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
    console.error('操作失败:', error)
  }
}

// 编辑用户
const handleEdit = async (user: {
  username: string
  name: string | null
  age: number | null
  address: string | null
  phone: string | null
  email: string
  roles: { name: string; description: string }[]
}) => {
  editing.value = {
    ...user,
    roles: user.roles.map(role => role.name) // 提取角色名称数组
  }

  form.value = {
    username: user.username,
    name: user.name || null,
    age: user.age || null,
    address: user.address || null,
    phone: user.phone || null,
    email: user.email || '',
    password: '' // 密码留空表示不修改
  }

  // 如果用户角色为空，则调用接口获取
  if (user.roles.length === 0) {
    const userRoles = await fetchUserRoles(user.username)
    assignedRoles.value = userRoles.map(role => role.name)
  } else {
    // 否则直接使用已加载的角色
    assignedRoles.value = user.roles.map(role => role.name)
  }
}

// 删除用户（需要同时处理角色解绑，这里假设删除用户时自动解绑所有角色）
const handleDelete = async (username: string) => {
  if (!confirm('确认删除该用户？此操作不可撤销！')) return

  try {
    // 先获取用户现有角色并批量解绑
    const user = users.value.find(u => u.username === username)
    if (user!.roles.length > 0) {
      await Promise.all(user!.roles.map(role =>
          fetch(`/api/roles/bind?username=${username}&roleName=${role.name}`, {
            method: 'DELETE',
            headers: {
              Authorization: `${localStorage.getItem('token') || ''}`
            }
          })
      ))
    }

    const response = await fetch(`/api/user/${username}`, {
      method: 'DELETE',
      headers: {
        Authorization: `${localStorage.getItem('token') || ''}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '删除用户失败')
    }

    ElMessage.success('用户删除成功')
    fetchUsers()
  } catch (error: any) {
    ElMessage.error(error.message || '删除用户失败')
    console.error('删除用户失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    username: '',
    name: null,
    age: null,
    address: null,
    phone: null,
    password: '',
    email: ''
  }
  editing.value = null
  errorMessage.value = ''
  searchName.value = ''
  assignedRoles.value = [] // 重置角色选择
}

const handleExport = () => {
  const headers = ['用户名', '昵称', '邮箱', '角色', '年龄', '地址', '手机号']
  const rows = users.value.map(user => [
    user.username,
    user.name || '-',
    user.email,
    user.roles.length ? user.roles.map(role => role.name).join(',') : '-',
    user.age || '-',
    user.address || '-',
    user.phone || '-'
  ])

  const csvContent = [
    headers.join(','), // 表头行
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')) // 转义单元格内容并拼接行
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `users_${new Date().toISOString().replace(/:/g, '-')}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link) // 清理临时链接
}

// 初始化
onMounted(() => {
  fetchUsers()
  fetchRoles()
})

// 监听搜索条件或分页变化
watch([searchName, page, pageSize], () => {
  fetchUsers()
})
</script>

<style scoped>
/* 多选下拉样式 */
select[multiple] {
  min-height: 64px;
  overflow-y: auto;
}

select[multiple] option {
  padding: 4px 8px;
}

/* 表格悬停效果 */
tbody tr:hover {
  cursor: pointer;
  background-color: #f3f4f6;
}

/* 分页按钮样式 */
.pagination-button {
  transition: all 0.2s ease;
}

.pagination-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
