<script setup>
import { useRouter, RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import store from 'store'
import { useCurrentGuest } from '@/stores/currentGuest'
import { useCurrentAdmin } from '@/stores/currentAdmin'
const router = useRouter()
const currentAdmin = ref()
const currentGuest = ref()
const currentGuestStore = useCurrentGuest()
const currentAdminStore = useCurrentAdmin()

currentGuestStore.$subscribe((mutation, state) => {
  if (state.currentGuest) {
    currentGuest.value = { ...state.currentGuest }
  }
})
currentAdminStore.$subscribe((mutation, state) => {
  if (state.currentAdmin) {
    currentAdmin.value = { ...state.currentAdmin }
  }
})

const handleUser = () => {
  if (currentAdmin.value) {
    store.remove('admin')
    currentAdminStore.currentAdmin = null
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
onMounted(async () => {
  currentGuestStore.currentGuest = store.get('guest')
  currentAdminStore.currentAdmin = store.get('admin')
  if (!currentAdmin.value && !currentGuest.value) {
    router.push('/')
  }
})
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

