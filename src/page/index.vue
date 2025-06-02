<script setup lang="ts">

</script>

<template>
  <div class="home">
    <div class="header">Mobile class - 移动互动课堂</div>
    <div class="row">
      <!-- 侧边栏 -->
      <div class="sidebar">
        <el-collapse expand-icon-position="left">
          <el-collapse-item title="用户管理" name="1">
            <div class="sidebar-item">全部用户</div>
          </el-collapse-item>
          <el-collapse-item title="悬赏管理" name="2">
            悬赏管理
          </el-collapse-item>
          <el-collapse-item title="课堂管理(教师)" name="3">
            课堂管理
          </el-collapse-item>
          <el-collapse-item title="我的课程(学生)" name="4">
            课程管理
          </el-collapse-item>
        </el-collapse>
      </div>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.header {
  width: 100%;
  height: 80px;
  background-color: #3d4f63;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}
.row{
  display: flex;
  flex-direction: row;
}

.sidebar {
  width: 300px;
  height: calc(100vh - 100px);
  background-color: #ebf1ef;
  box-shadow: #888888 5px 0 10px;
  z-index: 10;
}
.content {
  background-color: #F4F6F8;
  width: calc(100vw - 300px);
  height: calc(100vh - 100px);
  padding: 20px;
}
.sidebar-item {
  text-align: center;
}
</style>
