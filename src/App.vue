<script setup>
import { useRouter, RouterView } from 'vue-router'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import store from 'store'

const router = useRouter()
const currentAdmin = ref(store.get('admin'))
const handleUser = () => {
  if (currentAdmin.value) {
    store.remove('admin')
    currentAdmin.value = null
    ElMessage({
      message: 'You have log out the account.',
      type: 'success',
    })
    router.push('/')
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div class="px-20">
    <header class="mb-20">
      <el-menu
          mode="horizontal"
          :router="true"
      >
        <el-menu-item index="/" v-if="!currentAdmin">Reservation</el-menu-item>
        <el-menu-item index="/records">Records</el-menu-item>
        <el-menu-item @click="handleUser">{{currentAdmin ? `I'm not ${currentAdmin.name}.` : 'I\'m a staff.'}}</el-menu-item>
      </el-menu>
    </header>
    <RouterView />
  </div>
</template>

