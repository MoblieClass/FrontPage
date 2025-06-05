<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 课程数据结构
interface Course {
  id: number
  courseName: string
  teacherName: string
  courseType: string
  classroom: string
  startTime: string
  endTime: string
  startWeek: string
  endWeek: string
}

// 状态管理
const courses = ref<Course[]>([])
const loading = ref(false)
const error = ref('')
const selectedCourse = ref<Course | null>(null)
const currentWeek = ref(1)
const totalWeeks = 20

// 获取课程数据
const fetchCourses = async () => {
  loading.value = true
  error.value = ''

  try {
    const username = localStorage.getItem('username')??''
    const response = await fetch(`/api/course/stu_course/${username}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    courses.value = await response.json()
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch courses'
  } finally {
    loading.value = false
  }
}

// 计算课程是否在当前周显示
const isCourseInCurrentWeek = (course: Course) => {
  const start = parseInt(course.startWeek)
  const end = parseInt(course.endWeek)
  return currentWeek.value >= start && currentWeek.value <= end
}

// 打开课程详情
const openCourseDetail = (course: Course) => {
  selectedCourse.value = course
}

// 关闭课程详情
const closeCourseDetail = () => {
  selectedCourse.value = null
}

// 切换周次
const changeWeek = (direction: 'prev' | 'next') => {
  if (direction === 'prev' && currentWeek.value > 1) {
    currentWeek.value--
  } else if (direction === 'next' && currentWeek.value < totalWeeks) {
    currentWeek.value++
  }
}

// 导出课程表为CSV
const exportCourses = () => {
  // 过滤当前周的课程
  const currentWeekCourses = courses.value.filter(course =>
      parseInt(course.startWeek) <= currentWeek.value &&
      parseInt(course.endWeek) >= currentWeek.value
  )

  if (currentWeekCourses.length === 0) {
    alert('当前周没有课程可导出')
    return
  }

  // 构建CSV内容
  let csvContent = "课程名称,授课老师,课程类型,上课地点,上课时间,上课周次\n"

  currentWeekCourses.forEach(course => {
    const row = `${course.courseName},${course.teacherName},${course.courseType},${course.classroom},${course.startTime}-${course.endTime},${course.startWeek}-${course.endWeek}周\n`
    csvContent += row
  })

  // 创建并下载CSV文件
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `第${currentWeek.value}周课程表.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  fetchCourses()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <!-- 顶部导航 -->
    <header class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">
            <i class="fa fa-book mr-2"></i>用户课程表
          </h1>

          <!-- 功能按钮区 -->
          <div class="flex items-center space-x-4">
            <!-- 周次选择器 -->
            <div class="flex items-center space-x-2">
              <button
                  @click="changeWeek('prev')"
                  class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  :disabled="currentWeek === 1"
              >
                <i class="fa fa-chevron-left text-gray-600"></i>
              </button>

              <span class="text-lg font-medium">第 {{ currentWeek }} 周</span>

              <button
                  @click="changeWeek('next')"
                  class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  :disabled="currentWeek === totalWeeks"
              >
                <i class="fa fa-chevron-right text-gray-600"></i>
              </button>
            </div>

            <!-- 导出按钮 -->
            <button
                @click="exportCourses"
                class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <i class="fa fa-download mr-2"></i>导出课程表
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <p class="text-red-700">
          <i class="fa fa-exclamation-circle mr-2"></i>{{ error }}
        </p>
      </div>

      <!-- 课程列表 -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
            v-for="course in courses"
            :key="course.id"
            v-show="isCourseInCurrentWeek(course)"
            class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-[1.02]"
        >
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ course.courseName }}
              </h3>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {{ course.courseType }}
              </span>
            </div>

            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center">
                <i class="fa fa-user w-5 text-gray-500"></i>
                <span class="ml-2">授课老师: {{ course.teacherName }}</span>
              </div>

              <div class="flex items-center">
                <i class="fa fa-clock w-5 text-gray-500"></i>
                <span class="ml-2">时间: {{ course.startTime }}-{{ course.endTime }}</span>
              </div>

              <div class="flex items-center">
                <i class="fa fa-map-marker w-5 text-gray-500"></i>
                <span class="ml-2">地点: {{ course.classroom }}</span>
              </div>

              <div class="flex items-center">
                <i class="fa fa-calendar w-5 text-gray-500"></i>
                <span class="ml-2">周次: {{ course.startWeek }}-{{ course.endWeek }}周</span>
              </div>
            </div>

            <div class="mt-4">
              <button
                  @click="openCourseDetail(course)"
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center"
              >
                <i class="fa fa-info-circle mr-2"></i>查看详情
              </button>
            </div>
          </div>
        </div>

        <!-- 无课程提示 -->
        <div
            v-if="courses.length > 0 && courses.filter(c => isCourseInCurrentWeek(c)).length === 0"
            class="col-span-full bg-white rounded-lg p-8 text-center"
        >
          <i class="fa fa-calendar-check-o text-gray-400 text-5xl mb-4"></i>
          <p class="text-gray-500">本周没有课程安排</p>
        </div>

        <!-- 初始状态提示 -->
        <div v-else-if="courses.length === 0" class="col-span-full bg-white rounded-lg p-8 text-center">
          <i class="fa fa-book text-gray-400 text-5xl mb-4"></i>
          <p class="text-gray-500">暂无课程数据</p>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t border-gray-200 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p class="text-center text-gray-500 text-sm">
          © 2025 移动互动课堂
        </p>
      </div>
    </footer>

    <!-- 课程详情模态框 -->
    <div
        v-if="selectedCourse"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeCourseDetail"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
        <div class="p-6">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold text-gray-900">
              {{ selectedCourse.courseName }}
            </h3>
            <button
                @click="closeCourseDetail"
                class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <i class="fa fa-times text-xl"></i>
            </button>
          </div>

          <div class="space-y-4 text-gray-700">
            <div class="flex">
              <div class="w-1/3 text-gray-500">课程名称:</div>
              <div class="w-2/3 font-medium">{{ selectedCourse.courseName }}</div>
            </div>

            <div class="flex">
              <div class="w-1/3 text-gray-500">授课老师:</div>
              <div class="w-2/3 font-medium">{{ selectedCourse.teacherName }}</div>
            </div>

            <div class="flex">
              <div class="w-1/3 text-gray-500">课程类型:</div>
              <div class="w-2/3 font-medium">{{ selectedCourse.courseType }}</div>
            </div>

            <div class="flex">
              <div class="w-1/3 text-gray-500">上课地点:</div>
              <div class="w-2/3 font-medium">{{ selectedCourse.classroom }}</div>
            </div>

            <div class="flex">
              <div class="w-1/3 text-gray-500">上课时间:</div>
              <div class="w-2/3 font-medium">{{ selectedCourse.startTime }}-{{ selectedCourse.endTime }}</div>
            </div>

            <div class="flex">
              <div class="w-1/3 text-gray-500">上课周次:</div>
              <div class="w-2/3 font-medium">{{ selectedCourse.startWeek }}-{{ selectedCourse.endWeek }}周</div>
            </div>
          </div>

          <div class="mt-6">
            <button
                @click="closeCourseDetail"
                class="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式 */
</style>
