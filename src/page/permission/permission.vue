<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import 'element-plus/dist/index.css'

// 定义数据类型
interface Permission {
  id: number
  title: string
  description: string
  permissionName: string
}

interface Role {
  id: number
  name: string
  description: string
}

// 状态管理
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const rolePermissions = ref<Permission[]>([])
const selectedRole = ref('')
const newRole = ref('')
const newRoleDesc = ref('')
const newPermission = ref('')
const newPermissionTitle = ref('')
const newPermissionDesc = ref('')
const isLoading = ref(false)

// API配置
const apiBaseUrl = '/api'

// 错误处理函数
const handleError = (error: any, defaultMessage: string) => {
  if (error instanceof Error) {
    ElMessage.error(error.message)
  } else if (typeof error === 'string') {
    ElMessage.error(error)
  } else {
    ElMessage.error(defaultMessage)
  }
  console.error(error)
}

// 通用fetch请求函数
const fetchData = async <T>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('权限不足，需要root权限')
      }
      throw new Error(`请求失败: ${response.status} ${response.statusText}`)
    }

    return await response.json() as T
  } catch (error) {
    throw error
  }
}

// 获取所有角色
const fetchRoles = async () => {
  isLoading.value = true
  try {
    roles.value = await fetchData<Role[]>(`${apiBaseUrl}/roles`,{
      method: 'GET',
      headers:{
        Authorization: `${localStorage.getItem('token')}`
      }
    })
  } catch (error) {
    handleError(error, '获取角色列表失败')
  } finally {
    isLoading.value = false
  }
}

// 获取所有权限
const fetchPermissions = async () => {
  isLoading.value = true
  try {
    permissions.value = await fetchData<Permission[]>(`${apiBaseUrl}/permissions`,{
      method: 'GET',
      headers:{
        Authorization: `${localStorage.getItem('token')}`
      }
    })
  } catch (error) {
    handleError(error, '获取权限列表失败')
  } finally {
    isLoading.value = false
  }
}

// 获取角色权限
const fetchRolePermissions = async (roleName: string) => {
  isLoading.value = true
  try {
    rolePermissions.value = await fetchData<Permission[]>(`${apiBaseUrl}/roles/${roleName}/permissions`)
  } catch (error) {
    handleError(error, '获取角色权限失败')
  } finally {
    isLoading.value = false
  }
}

// 添加角色
const addRole = async () => {
  if (!newRole.value.trim()) {
    ElMessage.warning('角色名称不能为空')
    return
  }

  try {
    await fetchData(`${apiBaseUrl}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        name: newRole.value,
        description: newRoleDesc.value
      })
    })

    ElMessage.success('角色添加成功')
    newRole.value = ''
    newRoleDesc.value = ''
    fetchRoles()
  } catch (error) {
    handleError(error, '添加角色失败')
  }
}

// 删除角色
const deleteRole = async (roleName: string) => {
  ElMessageBox.confirm(
      `确定要删除角色 "${roleName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await fetchData(`${apiBaseUrl}/roles/${roleName}`, {
        method: 'DELETE',
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      })

      ElMessage.success('角色删除成功')
      if (selectedRole.value === roleName) {
        selectedRole.value = ''
        rolePermissions.value = []
      }
      fetchRoles()
    } catch (error) {
      handleError(error, '删除角色失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 添加权限
const addPermission = async () => {
  if (!newPermission.value.trim()) {
    ElMessage.warning('权限标识不能为空')
    return
  }

  try {
    await fetchData(`${apiBaseUrl}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        permissionName: newPermission.value,
        title: newPermissionTitle.value,
        description: newPermissionDesc.value
      })
    })

    ElMessage.success('权限添加成功')
    newPermission.value = ''
    newPermissionTitle.value = ''
    newPermissionDesc.value = ''
    fetchPermissions()
    if (selectedRole.value) {
      fetchRolePermissions(selectedRole.value)
    }
  } catch (error) {
    handleError(error, '添加权限失败')
  }
}

// 删除权限
const deletePermission = async (permissionName: string) => {
  ElMessageBox.confirm(
      `确定要删除权限 "${permissionName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await fetchData(`${apiBaseUrl}/permissions/${permissionName}`, {
        method: 'DELETE',
        headers: {
          Authorization: `${localStorage.getItem('token')}`
        }
      })

      ElMessage.success('权限删除成功')
      fetchPermissions()
      if (selectedRole.value) {
        fetchRolePermissions(selectedRole.value)
      }
    } catch (error) {
      handleError(error, '删除权限失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 给角色添加权限
const addPermissionToRole = async (permissionName: string) => {
  if (!selectedRole.value) {
    ElMessage.warning('请先选择角色')
    return
  }

  try {
    await fetchData(
        `${apiBaseUrl}/roles/${selectedRole.value}/permissions?permissionName=${permissionName}`,
        {
          method: 'POST',
          headers: {
            Authorization: `${localStorage.getItem('token')}`
          }
        }
    )

    ElMessage.success('权限添加到角色成功')
    fetchRolePermissions(selectedRole.value)
  } catch (error) {
    handleError(error, '添加权限到角色失败')
  }
}

// 从角色移除权限
const removePermissionFromRole = async (permissionName: string) => {
  if (!selectedRole.value) {
    ElMessage.warning('请先选择角色')
    return
  }

  ElMessageBox.confirm(
      `确定要从角色 "${selectedRole.value}" 移除权限 "${permissionName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(async () => {
    try {
      await fetchData(
          `${apiBaseUrl}/roles/${selectedRole.value}/permissions?permissionName=${permissionName}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `${localStorage.getItem('token')}`
            }
          }
      )

      ElMessage.success('权限从角色移除成功')
      fetchRolePermissions(selectedRole.value)
    } catch (error) {
      handleError(error, '从角色移除权限失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 监听角色选择变化
watch(selectedRole, (newRole) => {
  if (newRole) {
    fetchRolePermissions(newRole)
  } else {
    rolePermissions.value = []
  }
})

// 计算未分配给当前角色的权限
const availablePermissions = computed(() => {
  if (!selectedRole.value) return []

  const rolePermNames = rolePermissions.value.map(p => p.permissionName)
  return permissions.value.filter(p => !rolePermNames.includes(p.permissionName))
})

// 初始化数据
onMounted(() => {
  fetchRoles()
  fetchPermissions()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6 text-center">权限管理系统</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 角色管理 -->
      <div class="bg-white rounded-lg shadow-md p-5">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <i class="fa fa-users mr-2"></i>角色管理
        </h2>

        <div class="mb-4">
          <div class="flex flex-col sm:flex-row gap-2">
            <input
                type="text"
                v-model="newRole"
                placeholder="角色名称"
                class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
            <input
                type="text"
                v-model="newRoleDesc"
                placeholder="角色描述"
                class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
            <button
                @click="addRole"
                class="bg-primary hover:bg-primary/90 bg-blue-600 text-white px-4 py-2 rounded-md transition-all whitespace-nowrap"
            >
              <i class="fa fa-plus mr-1"></i>添加角色
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色名称</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="role in roles" :key="role.id"
                :class="selectedRole === role.name ? 'bg-blue-50' : ''"
                @click="selectedRole = role.name"
                class="cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ role.name }}</div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ role.description || '-' }}</div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <button
                    @click.stop="deleteRole(role.name)"
                    class="text-red-600 hover:text-red-900"
                >
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="isLoading" class="mt-4 text-center text-gray-500">
          <i class="fa fa-spinner fa-spin mr-1"></i>加载中...
        </div>
      </div>

      <!-- 角色权限分配 -->
      <div class="bg-white rounded-lg shadow-md p-5">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <i class="fa fa-link mr-2"></i>角色权限分配
        </h2>

        <div v-if="!selectedRole" class="text-center py-12 text-gray-500">
          <i class="fa fa-info-circle text-4xl mb-3"></i>
          <p>请从左侧选择一个角色</p>
        </div>

        <div v-else>
          <div class="mb-4">
            <h3 class="font-medium text-gray-700 mb-2">角色: {{ selectedRole }}</h3>

            <div class="flex flex-col sm:flex-row gap-2 mb-4">
              <select
                  v-model="newPermission"
                  class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">选择权限...</option>
                <option
                    v-for="permission in availablePermissions"
                    :key="permission.id"
                    :value="permission.permissionName"
                >
                  {{ permission.permissionName }} - {{ permission.title || permission.description || '无描述' }}
                </option>
              </select>
              <button
                  @click="addPermissionToRole(newPermission)"
                  :disabled="!newPermission"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-all whitespace-nowrap"
              >
                <i class="fa fa-plus mr-1"></i>添加到角色
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">权限标识</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="permission in rolePermissions" :key="permission.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ permission.permissionName }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ permission.title || '-' }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ permission.description || '-' }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <button
                      @click.stop="removePermissionFromRole(permission.permissionName)"
                      class="text-red-600 hover:text-red-900"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div v-if="rolePermissions.length === 0" class="text-center py-8 text-gray-500">
            <p>该角色尚未分配任何权限</p>
          </div>
        </div>

        <div v-if="isLoading" class="mt-4 text-center text-gray-500">
          <i class="fa fa-spinner fa-spin mr-1"></i>加载中...
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-5">
      <!-- 权限管理 -->
      <div class="bg-white rounded-lg shadow-md p-5">
        <h2 class="text-lg font-semibold mb-4 flex items-center">
          <i class="fa fa-key mr-2"></i>权限管理
        </h2>

        <div class="mb-4">
          <div class="flex flex-col sm:flex-col gap-2">
            <input
                type="text"
                v-model="newPermission"
                placeholder="权限标识"
                class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
            <input
                type="text"
                v-model="newPermissionTitle"
                placeholder="权限标题"
                class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
            <input
                type="text"
                v-model="newPermissionDesc"
                placeholder="权限描述"
                class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
            <button
                @click="addPermission"
                class="bg-primary hover:bg-primary/90 bg-blue-600 text-white px-4 py-2 rounded-md transition-all whitespace-nowrap"
            >
              <i class="fa fa-plus mr-1"></i>添加权限
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">权限标识</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="permission in permissions" :key="permission.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ permission.permissionName }}</div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ permission.title || '-' }}</div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ permission.description || '-' }}</div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <button
                    @click.stop="deletePermission(permission.permissionName)"
                    class="text-red-600 hover:text-red-900"
                >
                  <i class="fa fa-trash"></i>
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="isLoading" class="mt-4 text-center text-gray-500">
          <i class="fa fa-spinner fa-spin mr-1"></i>加载中...
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 定义主要颜色变量 */
:root {
  --primary: #3b82f6;
}


/* 全局样式 */
body {
  font-family: 'Inter', system-ui, sans-serif;
}

/* 表格样式优化 */
.table-hover tr:hover {
  background-color: rgba(59, 130, 246, 0.05);
}

/* 按钮动画效果 */
.btn {
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 加载动画 */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 640px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .flex-col {
    flex-direction: column;
  }

  .flex-1 {
    min-width: 0;
  }
}
</style>
