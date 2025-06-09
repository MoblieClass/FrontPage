<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      <header>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between md:space-x-5 lg:items-center">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">课堂管理</h1>
            <button @click="openAddModal" class="md:hidden bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200">
              <i class="fa fa-plus mr-1"></i> 添加课程
            </button>
          </div>
          <div class="mt-4 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center sm:space-x-4 md:mt-0 md:flex-row md:space-x-0">
            <div class="mt-4 flex items-center sm:mt-0">
              <div class="relative">
                <input
                    v-model="searchQuery"
                    @input="searchCourses"
                    type="text"
                    placeholder="搜索课程..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="fa fa-search text-gray-400"></i>
                </div>
              </div>
            </div>
            <button @click="openAddModal" class="hidden md:block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200">
              <i class="fa fa-plus mr-1"></i> 添加课程
            </button>
          </div>
        </div>
      </header>

      <div class="mt-6">
        <div class="bg-white shadow-sm rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">课程名称</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开始时间</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结束时间</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上课周</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="course in courses" :key="course.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ course.courseName }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ course.startTime }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ course.endTime }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ course.startWeek }}-{{ course.endWeek }}周</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="openEditModal(course)" class="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors duration-150">
                    <i class="fa fa-edit mr-1"></i> 编辑
                  </button>
                  <button @click="openDeleteModal(course)" class="text-red-600 hover:text-red-900 transition-colors duration-150">
                    <i class="fa fa-trash mr-1"></i> 删除
                  </button>
                  <button @click="openStudentModal(course)" class="text-green-600 hover:text-green-900 ml-3 transition-colors duration-150">
                    <i class="fa fa-users mr-1"></i> 学生
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  显示第 <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> 至 <span class="font-medium">{{ Math.min(currentPage * pageSize, totalCourses) }}</span> 条，共 <span class="font-medium">{{ totalCourses }}</span> 条记录
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                      @click="handleExport"
                      class="ml-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    <i class="fa fa-download mr-1"></i> 导出课程数据
                  </button>
                  <button
                      @click="prevPage"
                      :disabled="currentPage === 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <span class="sr-only">上一页</span>
                    <i class="fa fa-chevron-left"></i>
                  </button>
                  <button
                      v-for="page in pageCount"
                      :key="page"
                      @click="goToPage(page)"
                      :class="page === currentPage ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                      class="relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200"
                  >
                    {{ page }}
                  </button>
                  <button
                      @click="nextPage"
                      :disabled="currentPage === pageCount"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <span class="sr-only">下一页</span>
                    <i class="fa fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加课程模态框 -->
    <div v-if="isAddModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">添加课程</h3>
                <div class="mt-2 space-y-4">
                  <div>
                    <label for="courseName" class="block text-sm font-medium text-gray-700 mb-1">课程名称</label>
                    <input type="text" v-model="newCourse.courseName" id="courseName" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="courseName" class="block text-sm font-medium text-gray-700 mb-1">课程类别</label>
                    <input type="text" v-model="newCourse.courseType" id="courseType" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="courseName" class="block text-sm font-medium text-gray-700 mb-1">教师姓名</label>
                    <input type="text" v-model="newCourse.teacherName" id="teacherName" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="courseName" class="block text-sm font-medium text-gray-700 mb-1">教室名</label>
                    <input type="text" v-model="newCourse.classroom" id="classroom" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="startTime" class="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                    <input type="text" v-model="newCourse.startTime" id="startTime" placeholder="HH:mm" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="endTime" class="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                    <input type="text" v-model="newCourse.endTime" id="endTime" placeholder="HH:mm" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="startWeek" class="block text-sm font-medium text-gray-700 mb-1">开始周</label>
                    <input type="number" v-model.number="newCourse.startWeek" id="startWeek" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="endWeek" class="block text-sm font-medium text-gray-700 mb-1">结束周</label>
                    <input type="number" v-model.number="newCourse.endWeek" id="endWeek" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" @click="addCourse" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              确认
            </button>
            <button type="button" @click="closeAddModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑课程模态框 -->
    <div v-if="isEditModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">编辑课程</h3>
                <div class="mt-2 space-y-4">
                  <div>
                    <label for="editCourseName" class="block text-sm font-medium text-gray-700 mb-1">课程名称</label>
                    <input type="text" v-model="editCourse.courseName" id="editCourseName" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="editCourseName" class="block text-sm font-medium text-gray-700 mb-1">课程类别</label>
                    <input type="text" v-model="editCourse.courseType" id="editCourseType" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="editCourseName" class="block text-sm font-medium text-gray-700 mb-1">教师名</label>
                    <input type="text" v-model="editCourse.teacherName" id="editTeacherName" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="editCourseName" class="block text-sm font-medium text-gray-700 mb-1">教室名</label>
                    <input type="text" v-model="editCourse.classroom" id="editClassroom" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="editStartTime" class="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                    <input type="text" v-model="editCourse.startTime" id="editStartTime" placeholder="HH:mm" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="editEndTime" class="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                    <input type="text" v-model="editCourse.endTime" id="editEndTime" placeholder="HH:mm" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="editStartWeek" class="block text-sm font-medium text-gray-700 mb-1">开始周</label>
                    <input type="number" v-model.number="editCourse.startWeek" id="editStartWeek" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                  <div>
                    <label for="editEndWeek" class="block text-sm font-medium text-gray-700 mb-1">结束周</label>
                    <input type="number" v-model.number="editCourse.endWeek" id="editEndWeek" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" @click="updateCourse" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              确认
            </button>
            <button type="button" @click="closeEditModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除课程模态框 -->
    <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">删除课程</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    确定要删除课程 "{{ delete_Course.courseName }}" 吗？此操作不可撤销。
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" @click="deleteCourse" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              删除
            </button>
            <button type="button" @click="closeDeleteModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 学生管理模态框 -->
    <div v-if="isStudentModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">课程学生管理 - {{ currentCourse?.courseName }}</h3>
                  <div class="flex items-center">
                    <button @click="openAddStudentModal" class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition-all duration-200">
                      <i class="fa fa-plus mr-1"></i> 添加学生
                    </button>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户名</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">昵称</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">邮箱</th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="student in courseStudents" :key="student.id" class="hover:bg-gray-50 transition-colors duration-150">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ student.username }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ student.name }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ student.email }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button @click="removeStudent(student.username)" class="text-red-600 hover:text-red-900 transition-colors duration-150">
                          <i class="fa fa-trash mr-1"></i> 移除
                        </button>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" @click="closeStudentModal" class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加学生模态框 -->
    <div v-if="isAddStudentModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">添加学生到课程</h3>
                <div class="mt-2 space-y-4">
                  <div>
                    <label for="studentUsername" class="block text-sm font-medium text-gray-700 mb-1">学生用户名</label>
                    <input type="text" v-model="newStudentUsername" id="studentUsername" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" @click="addStudent" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              添加
            </button>
            <button type="button" @click="closeAddStudentModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知组件 -->
    <div v-if="notification.show" class="fixed top-4 right-4 z-50 transition-all duration-500" :class="notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
      <div class="flex items-center p-4 text-white rounded-lg shadow-lg">
        <div class="mr-3">
          <i :class="notification.type === 'success' ? 'fa fa-check-circle' : 'fa fa-exclamation-circle'"></i>
        </div>
        <div>
          <p class="font-medium">{{ notification.message }}</p>
        </div>
        <button @click="hideNotification" class="ml-4 text-white hover:text-gray-200">
          <i class="fa fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue';

// 状态管理
interface Course{
  "id": 2,
  "courseName": string,
  "teacherName": string,
  "courseType": string,
  "classroom": string,
  "startTime": string,
  "endTime": string,
  "startWeek": string,
  "endWeek": string
}
const courses = ref<Course[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const totalCourses = ref(0);
const searchQuery = ref('');
const courseStudents = ref<any>([]);
const currentCourse = ref<Course>();

// 模态框状态
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isStudentModalOpen = ref(false);
const isAddStudentModalOpen = ref(false);

// 表单数据
const newCourse = ref({
  "courseName": "",
  "teacherName": "",
  "courseType": "",
  "classroom": "",
  "startTime": "",
  "endTime": "",
  "startWeek": "",
  "endWeek": ""
});

const editCourse = ref({
  "courseName": "",
  "teacherName": "",
  "courseType": "",
  "classroom": "",
  "startTime": "",
  "endTime": "",
  "startWeek": "",
  "endWeek": ""
});

const delete_Course = ref();
const newStudentUsername = ref('');

// 通知
const notification = ref({
  show: false,
  type: 'success',
  message: ''
});

// 获取课程列表
const fetchCourses = async (page = 1, query = '') => {
  try {
    let url = `/api/course/all?page=${page}&size=${pageSize.value}`;
    if (query) {
      url = `/api/course/search?keyWord=${encodeURIComponent(query)}&page=${page}&size=${pageSize.value}`;
    }

    const response = await fetch(url,{
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('获取课程列表失败');
    }

    const result = await response.json();
    courses.value = result || [];
    totalCourses.value = result.length || 0;
    currentPage.value = page;
  } catch (error) {
    console.error('获取课程列表错误:', error);
    showNotification('获取课程列表失败', 'error');
  }
};

// 搜索课程
const searchCourses = () => {
  fetchCourses(1, searchQuery.value);
};

// 分页控制
const pageCount = computed(() => Math.ceil(totalCourses.value / pageSize.value));

const prevPage = () => {
  if (currentPage.value > 1) {
    fetchCourses(currentPage.value - 1, searchQuery.value);
  }
};

const nextPage = () => {
  if (currentPage.value < pageCount.value) {
    fetchCourses(currentPage.value + 1, searchQuery.value);
  }
};

const goToPage = (page:number) => {
  fetchCourses(page, searchQuery.value);
};

// 添加课程相关
const openAddModal = () => {
  newCourse.value = {
    "courseName": "",
    "teacherName": "",
    "courseType": "",
    "classroom": "",
    "startTime": "",
    "endTime": "",
    "startWeek": "",
    "endWeek": ""
  };
  isAddModalOpen.value = true;
};

const closeAddModal = () => {
  isAddModalOpen.value = false;
};

const addCourse = async () => {
  try {
    const response = await fetch('/api/course/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`
      },
      body: JSON.stringify(newCourse.value)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '添加课程失败');
    }

    showNotification('课程添加成功', 'success');
    closeAddModal();
    fetchCourses();
  } catch (error:any) {
    console.error('添加课程错误:', error);
    showNotification(error.message || '添加课程失败', 'error');
  }
};

// 编辑课程相关
const openEditModal = (course:any) => {
  editCourse.value = { ...course };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  isEditModalOpen.value = false;
};

const updateCourse = async () => {
  try {
    const response = await fetch('/api/course/modify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`
      },
      body: JSON.stringify(editCourse.value)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '更新课程失败');
    }

    showNotification('课程更新成功', 'success');
    closeEditModal();
    fetchCourses();
  } catch (error:any) {
    console.error('更新课程错误:', error);
    showNotification(error.message || '更新课程失败', 'error');
  }
};

// 删除课程相关
const openDeleteModal = (course:any) => {
  delete_Course.value = { ...course };
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
};

const deleteCourse = async () => {
  try {
    const response = await fetch(`/api/course/delete?id=${delete_Course.value.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '删除课程失败');
    }

    showNotification('课程删除成功', 'success');
    closeDeleteModal();
    fetchCourses();
  } catch (error:any) {
    console.error('删除课程错误:', error);
    showNotification(error.message || '删除课程失败', 'error');
  }
};

// 学生管理相关
const openStudentModal = async (course:any) => {
  currentCourse.value = { ...course };
  await fetchCourseStudents();
  isStudentModalOpen.value = true;
};

const closeStudentModal = () => {
  isStudentModalOpen.value = false;
};

// 获取课程学生列表
const fetchCourseStudents = async (query = '') => {
  try {
    let url = `/api/course/${currentCourse?.value?.id}/students`;
    if (query) {
      url += `?search=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url,{
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('获取学生列表失败');
    }

    courseStudents.value = await response.json();
  } catch (error) {
    console.error('获取学生列表错误:', error);
    showNotification('获取学生列表失败', 'error');
  }
};

// 添加学生到课程
const openAddStudentModal = () => {
  newStudentUsername.value = '';
  isAddStudentModalOpen.value = true;
};

const closeAddStudentModal = () => {
  isAddStudentModalOpen.value = false;
};

const addStudent = async () => {
  try {
    const response = await fetch(`/api/course/addUser?courseId=${currentCourse?.value?.id}&username=${newStudentUsername.value}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '添加学生失败');
    }

    showNotification('学生添加成功', 'success');
    closeAddStudentModal();
    fetchCourseStudents();
  } catch (error:any) {
    console.error('添加学生错误:', error);
    showNotification(error.message || '添加学生失败', 'error');
  }
};

// 从课程移除学生
const removeStudent = async (username:string) => {
  try {
    const response = await fetch(`/api/course/removeUser?id=${currentCourse?.value?.id}&username=${username}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        "Authorization": `${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '移除学生失败');
    }

    showNotification('学生移除成功', 'success');
    fetchCourseStudents();
  } catch (error:any) {
    console.error('移除学生错误:', error);
    showNotification(error.message || '移除学生失败', 'error');
  }
};

// 通知相关
const showNotification = (message:string, type = 'success') => {
  notification.value = {
    show: true,
    type,
    message
  };

  // 3秒后自动隐藏
  setTimeout(hideNotification, 3000);
};

const hideNotification = () => {
  notification.value.show = false;
};

const handleExport = () => {
  // 构建 CSV 表头（与表格列对应）
  const headers = ['课程名称', '教师名', '课程类别', '教室名', '开始时间', '结束时间', '上课周'];

  // 提取当前分页的课程数据
  const rows = courses.value.map(course => [
    course.courseName,
    course.teacherName,
    course.courseType,
    course.classroom,
    course.startTime,
    course.endTime,
    `${course.startWeek}-${course.endWeek}周`
  ]);

  // 生成 CSV 字符串（包含表头和数据行）
  const csvContent = [
    headers.join(','), // 表头行
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')) // 数据行（转义引号和逗号）
  ].join('\n');

  // 创建 Blob 对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

  // 生成下载链接
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `课程数据_${new Date().toISOString().replace(/:/g, '-')}.csv`; // 带时间戳的文件名

  // 模拟点击下载
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link); // 清理临时链接
};

// 页面加载时获取课程列表
onMounted(() => {
  fetchCourses();
});
</script>

<style scoped>
/* 遮罩层（背景蒙层） */
.fixed.inset-0.z-50 {
  z-index: 40; /* 调整遮罩层层级 */
}

/* 模态框内容层 */
.inline-block.align-bottom.bg-white.rounded-lg {
  z-index: 50; /* 内容层层级高于遮罩层 */
  position: relative; /* 确保层级生效 */
}
</style>
