<script lang="ts" setup>
import {ref, onMounted, watch} from 'vue'
import dayjs from 'dayjs'

// 状态管理
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 分页和筛选
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchTitle = ref('')
const statusFilter = ref('all') // all, active, expired, completed

// 数据存储
const rewards = ref<RewardModel[]>([])
const currentReward = ref<RewardModel | null>(null)
const showRewardDetail = ref(false)
const showCreateForm = ref(false)
const showEditForm = ref(false)
const myCommits = ref<RewardCommit[]>([])

// 表单数据
const formData = ref<AddRewardRequest>({
  title: '',
  description: '',
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
  isFinished: false,
  bonus: ''
})

const commitContent = ref('')

// 获取悬赏列表
const fetchRewards = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    let url = `/api/reward/all?page=${page.value - 1}&size=${pageSize.value}`

    if (searchTitle.value) {
      url += `&title=${encodeURIComponent(searchTitle.value)}`
    }

    if (statusFilter.value !== 'all') {
      const now = dayjs().format('YYYY-MM-DDTHH:mm:ss')
      if (statusFilter.value === 'active') {
        url += `&endDate=${encodeURIComponent(now)}&comparison=gt`
      } else if (statusFilter.value === 'expired') {
        url += `&endDate=${encodeURIComponent(now)}&comparison=lt`
      } else if (statusFilter.value === 'completed') {
        url += `&isFinished=true`
      }
    }

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    rewards.value = data || []
    total.value = data.length || 0
  } catch (error: any) {
    errorMessage.value = error.message || '获取悬赏列表失败'
    console.error('获取悬赏列表失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 编辑悬赏
const editReward = (reward: RewardModel) => {
  currentReward.value = { ...reward }
  formData.value = {
    title: reward.title,
    description: reward.description,
    startDate: dayjs(reward.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(reward.endDate).format('YYYY-MM-DD'),
    isFinished: reward.isFinished,
    bonus: reward.bonus
  }
  showEditForm.value = true
}

// 创建悬赏
const createReward = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // 验证表单
    if (!formData.value.title || !formData.value.description || !formData.value.bonus) {
      throw new Error('请填写所有必填字段')
    }

    // 转换日期格式
    const requestData = {
      ...formData.value,
      startDate: dayjs(formData.value.startDate).toISOString(),
      endDate: dayjs(formData.value.endDate).toISOString()
    }

    const response = await fetch('/api/reward/add', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      throw new Error(`创建悬赏失败: ${await response.text()}`)
    }

    successMessage.value = '悬赏创建成功'
    showCreateForm.value = false
    fetchRewards()

    // 重置表单
    formData.value = {
      title: '',
      description: '',
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      isFinished: false,
      bonus: ''
    }
  } catch (error: any) {
    errorMessage.value = error.message
    console.error('创建悬赏失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 更新悬赏
const updateReward = async () => {
  if (!currentReward.value) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    // 验证表单
    if (!formData.value.title || !formData.value.description || !formData.value.bonus) {
      throw new Error('请填写所有必填字段')
    }

    // 转换日期格式
    const requestData = {
      ...formData.value,
      startDate: dayjs(formData.value.startDate).toISOString(),
      endDate: dayjs(formData.value.endDate).toISOString()
    }

    const response = await fetch(`/api/reward/${currentReward.value.id}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(requestData)
    })

    if (!response.ok) {
      throw new Error(`更新悬赏失败: ${await response.text()}`)
    }

    successMessage.value = '悬赏更新成功'
    showEditForm.value = false
    fetchRewards()
  } catch (error: any) {
    errorMessage.value = error.message
    console.error('更新悬赏失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 删除悬赏
const deleteReward = async (id: number) => {
  if (!confirm('确定要删除这个悬赏吗？此操作不可撤销。')) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(`/api/reward/${id}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`,},
    })

    if (!response.ok) {
      throw new Error(`删除悬赏失败: ${await response.text()}`)
    }

    successMessage.value = '悬赏删除成功'
    fetchRewards()
    if (currentReward.value?.id === id) {
      currentReward.value = null
      showRewardDetail.value = false
    }
  } catch (error: any) {
    errorMessage.value = error.message
    console.error('删除悬赏失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 获取悬赏详情
const getRewardDetail = async (id: number) => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`/api/reward/${id}`)

    if (!response.ok) {
      throw new Error(`获取悬赏详情失败: ${response.status}`)
    }

    currentReward.value = await response.json()
    showRewardDetail.value = true
    fetchMyCommits(id)
  } catch (error: any) {
    errorMessage.value = error.message
    console.error('获取悬赏详情失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 提交悬赏
const submitReward = async () => {
  if (!currentReward.value) return
  if (!commitContent.value.trim()) {
    errorMessage.value = '提交内容不能为空'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(`/api/reward/commit/${currentReward.value.id}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`,},
      body: JSON.stringify({content: commitContent.value})
    })

    if (!response.ok) {
      throw new Error(`提交悬赏失败: ${await response.text()}`)
    }

    successMessage.value = '悬赏提交成功'
    commitContent.value = ''
    fetchMyCommits(currentReward.value.id)
  } catch (error: any) {
    errorMessage.value = error.message
    console.error('提交悬赏失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 获取我的提交
const fetchMyCommits = async (rewardId: number) => {
  try {
    const response = await fetch(`/api/reward/${rewardId}/my-commits`)

    if (response.ok) {
      myCommits.value = await response.json()
    } else {
      myCommits.value = []
    }
  } catch (error) {
    myCommits.value = []
    console.error('获取我的提交失败:', error)
  }
}

// 格式化日期
const formatDate = (date: string | null) => {
  return date ? dayjs(date).format('YYYY-MM-DD') : '-'
}

// 检查悬赏状态
const getRewardStatus = (reward: RewardModel) => {
  const now = dayjs()
  const startDate = dayjs(reward.startDate)
  const endDate = dayjs(reward.endDate)

  if (reward.isFinished) return 'completed'
  if (now.isBefore(startDate)) return 'upcoming'
  if (now.isAfter(endDate)) return 'expired'
  return 'active'
}

// 状态样式
const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'completed':
      return 'bg-gray-100 text-gray-800'
    case 'upcoming':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '进行中'
    case 'expired':
      return '已过期'
    case 'completed':
      return '已完成'
    case 'upcoming':
      return '未开始'
    default:
      return '未知'
  }
}

// 初始化
onMounted(() => {
  fetchRewards()
})

// 监听分页和筛选条件变化
watch([page, pageSize, searchTitle, statusFilter], () => {
  fetchRewards()
})

// 类型定义
interface RewardModel {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  isFinished: boolean
  bonus: string
  creatorId: number
  creatorName: string
}

interface AddRewardRequest {
  title: string
  description: string
  startDate: string
  endDate: string
  isFinished: boolean
  bonus: string
}

interface RewardCommit {
  id: number
  rewardId: number
  userId: number
  username: string
  content: string
  createTime: string
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-6">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <i class="fa fa-trophy text-yellow-500 mr-2"></i>悬赏管理
      </h1>

      <!-- 错误和成功消息 -->
      <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
        <p><i class="fa fa-exclamation-circle mr-2"></i>{{ errorMessage }}</p>
      </div>

      <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
        <p><i class="fa fa-check-circle mr-2"></i>{{ successMessage }}</p>
      </div>

      <!-- 筛选工具栏 -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input
                  v-model="searchTitle"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="搜索悬赏标题..."
                  type="text"
              >
              <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <div class="flex-1 md:w-auto">
            <select
                v-model="statusFilter"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有状态</option>
              <option value="active">进行中</option>
              <option value="expired">已过期</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          <div class="w-auto">
            <button
                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                @click="showCreateForm = true"
            >
              <i class="fa fa-plus mr-2"></i>发布悬赏
            </button>
          </div>
        </div>
      </div>

      <!-- 悬赏列表 -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                标题
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                发布者
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                开始日期
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                结束日期
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                奖励
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                状态
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                操作
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="reward in rewards" :key="reward.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ reward.title }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ reward.creatorName || '未知' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(reward.startDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(reward.endDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ reward.bonus }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                  <span
                      :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(getRewardStatus(reward))]"
                  >
                    {{ getStatusText(getRewardStatus(reward)) }}
                  </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                    class="text-blue-600 hover:text-blue-900 mr-3"
                    @click="getRewardDetail(reward.id)"
                >
                  查看
                </button>
                <button
                    class="text-yellow-600 hover:text-yellow-900 mr-3"
                    @click="editReward(reward)"
                >
                  编辑
                </button>
                <button
                    class="text-red-600 hover:text-red-900"
                    @click="deleteReward(reward.id)"
                >
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
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                @click="page -= 1"
            >
              上一页
            </button>
            <button
                :disabled="page * pageSize >= total"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                @click="page += 1"
            >
              下一页
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                显示第 <span class="font-medium">{{ (page - 1) * pageSize + 1 }}</span> 到
                <span class="font-medium">{{ Math.min(page * pageSize, total) }}</span> 条，
                共 <span class="font-medium">{{ total }}</span> 条记录
              </p>
            </div>
            <div>
              <nav aria-label="Pagination" class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                    :disabled="page === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    @click="page -= 1"
                >
                  <span class="sr-only">上一页</span>
                  <i class="fa fa-chevron-left h-5 w-5"></i>
                </button>

                <!-- 页码显示逻辑 -->
                <button
                    v-for="p in Math.ceil(total / pageSize)"
                    :key="p"
                    :class="{
                    'bg-blue-50 border-blue-500 text-blue-600': p === page,
                    'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': p !== page
                  }"
                    class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    @click="page = p"
                >
                  {{ p }}
                </button>

                <button
                    :disabled="page * pageSize >= total"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    @click="page += 1"
                >
                  <span class="sr-only">下一页</span>
                  <i class="fa fa-chevron-right h-5 w-5"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- 悬赏详情模态框 -->
      <div v-if="showRewardDetail && currentReward" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div aria-hidden="true" class="fixed inset-0 transition-opacity">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <span aria-hidden="true" class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div
              class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {{ currentReward.title }}
                  </h3>

                  <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">发布者</div>
                    <div class="text-sm text-gray-900">{{ currentReward.creatorName || '未知' }}</div>
                  </div>

                  <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">开始日期</div>
                    <div class="text-sm text-gray-900">{{ formatDate(currentReward.startDate) }}</div>
                  </div>

                  <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">结束日期</div>
                    <div class="text-sm text-gray-900">{{ formatDate(currentReward.endDate) }}</div>
                  </div>

                  <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">奖励</div>
                    <div class="text-sm text-gray-900 font-medium">{{ currentReward.bonus }}</div>
                  </div>

                  <div class="mb-4">
                    <div class="text-sm text-gray-500 mb-1">状态</div>
                    <span
                        :class="['px-2 py-1 text-xs font-medium rounded-full', getStatusClass(getRewardStatus(currentReward))]"
                    >
                      {{ getStatusText(getRewardStatus(currentReward)) }}
                    </span>
                  </div>

                  <div class="mb-6">
                    <div class="text-sm text-gray-500 mb-1">描述</div>
                    <div class="text-sm text-gray-900 whitespace-pre-wrap">{{ currentReward.description }}</div>
                  </div>

                  <!-- 提交悬赏表单 -->
                  <div v-if="getStatusText(getRewardStatus(currentReward)) === '进行中'" class="mb-6">
                    <h4 class="text-sm font-medium text-gray-900 mb-2">提交悬赏</h4>
                    <textarea
                        v-model="commitContent"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入你的解决方案..."
                        rows="3"
                    ></textarea>
                    <button
                        class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        @click="submitReward"
                    >
                      提交
                    </button>
                  </div>

                  <!-- 我的提交 -->
                  <div v-if="myCommits.length > 0" class="mb-6">
                    <h4 class="text-sm font-medium text-gray-900 mb-2">我的提交</h4>
                    <div v-for="commit in myCommits" :key="commit.id" class="bg-gray-50 p-3 rounded-md mb-2">
                      <div class="text-xs text-gray-500 mb-1">提交于 {{ formatDate(commit.createTime) }}</div>
                      <div class="text-sm text-gray-900 whitespace-pre-wrap">{{ commit.content }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                  class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  type="button"
                  @click="showRewardDetail = false"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 创建悬赏模态框 -->
      <div v-if="showCreateForm" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div aria-hidden="true" class="fixed inset-0 transition-opacity">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <span aria-hidden="true" class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div
              class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    发布悬赏
                  </h3>

                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="title">标题 <span
                        class="text-red-500">*</span></label>
                    <input
                        id="title"
                        v-model="formData.title"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入悬赏标题"
                        type="text"
                    >
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="description">描述 <span
                        class="text-red-500">*</span></label>
                    <textarea
                        id="description"
                        v-model="formData.description"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请详细描述悬赏内容和要求"
                        rows="4"
                    ></textarea>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1" for="startDate">开始日期</label>
                      <input
                          id="startDate"
                          v-model="formData.startDate"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="date"
                      >
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1" for="endDate">结束日期</label>
                      <input
                          id="endDate"
                          v-model="formData.endDate"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="date"
                      >
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="bonus">奖励 <span
                        class="text-red-500">*</span></label>
                    <input
                        id="bonus"
                        v-model="formData.bonus"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入悬赏奖励"
                        type="text"
                    >
                  </div>

                  <div class="mb-4">
                    <label class="flex items-center">
                      <input
                          v-model="formData.isFinished"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          type="checkbox"
                      >
                      <span class="ml-2 block text-sm text-gray-700">标记为已完成</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  type="button"
                  @click="createReward"
              >
                创建
              </button>
              <button
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  type="button"
                  @click="showCreateForm = false"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑悬赏模态框 -->
      <div v-if="showEditForm && currentReward" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div aria-hidden="true" class="fixed inset-0 transition-opacity">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <span aria-hidden="true" class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <div
              class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    编辑悬赏
                  </h3>

                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-title">标题 <span
                        class="text-red-500">*</span></label>
                    <input
                        id="edit-title"
                        v-model="formData.title"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入悬赏标题"
                        type="text"
                    >
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-description">描述 <span
                        class="text-red-500">*</span></label>
                    <textarea
                        id="edit-description"
                        v-model="formData.description"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请详细描述悬赏内容和要求"
                        rows="4"
                    ></textarea>
                  </div>

                  <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-startDate">开始日期</label>
                      <input
                          id="edit-startDate"
                          v-model="formData.startDate"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="date"
                      >
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-endDate">结束日期</label>
                      <input
                          id="edit-endDate"
                          v-model="formData.endDate"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          type="date"
                      >
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-bonus">奖励 <span
                        class="text-red-500">*</span></label>
                    <input
                        id="edit-bonus"
                        v-model="formData.bonus"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入悬赏奖励"
                        type="text"
                    >
                  </div>

                  <div class="mb-4">
                    <label class="flex items-center">
                      <input
                          v-model="formData.isFinished"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          type="checkbox"
                      >
                      <span class="ml-2 block text-sm text-gray-700">标记为已完成</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  type="button"
                  @click="updateReward"
              >
                保存
              </button>
              <button
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  type="button"
                  @click="showEditForm = false"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
   /* 遮罩层（背景蒙层） */
 .fixed.inset-0.z-50 {
   z-index: 1040; /* 调整遮罩层层级 */
 }

/* 模态框内容层 */
.inline-block.align-bottom.bg-white.rounded-lg {
  z-index: 1050; /* 内容层层级高于遮罩层 */
  position: relative; /* 确保层级生效 */
}
</style>
