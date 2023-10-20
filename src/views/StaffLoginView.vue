<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import qs from 'qs'
import store from 'store'
import md5 from 'md5'
import {$axios} from "@/assets/axios";

const router = useRouter()
const currentAdmin = ref({})
const adminFormRef = ref()
const adminForm = ref({
  name: '',
  password: '',
})
const rules = ref({
  name: [
    {required: true, message: 'Please input a name', trigger: 'blur'},
    {min: 3, max: 20, message: 'Length should be 3 to 5', trigger: 'blur'},
  ],
  password: [
    {required: true, message: 'Please input a password', trigger: 'blur'},
    {min: 6, max: 20, message: 'Length should be 6 to 20', trigger: 'blur'},
  ],
})

const submitAdmin = async (formEl) => {
  await formEl.validate( async (valid, fields) => {
    if (valid) {
      const { data } = await $axios().get(`users?${qs.stringify({
        filter: {
          where: {
            name: adminForm.value.name,
            password: md5(adminForm.value.password),
            status: 1,
          },
          include: ['restaurant'],
        },
      }, {
        encodeValuesOnly: true,
      })}`)
      if (!data.length) {
        return ElMessage.error('Oops, the name or the password is incorrect.')
      }
      store.set('admin', data[0])
      currentAdmin.value = data[0]
      ElMessage({
        message: `Hi, ${currentAdmin.value.name}.`,
        type: 'success',
      })
      await router.push('/records')
    } else {
      console.log('error submit!', fields)
    }
  })
}
const logout = async () => {
  store.remove('admin')
  await router.push('/')
}
onMounted(async () => {
  currentAdmin.value = store.get('admin')
})
</script>

<template>
  <div>
    <div class="flex" v-if="currentAdmin">
      <div class="pl-10">Hi, {{ currentAdmin?.name }}.</div>
      <div class="pl-10">
        <el-button type="primary" link size="small" @click="logout">I'm not {{ currentAdmin?.name }}</el-button>
      </div>
    </div>
    <el-form
        v-else
        label-position="top"
        ref="adminFormRef"
        :model="adminForm"
        :rules="rules"
        label-width="120px"
        status-icon
    >
      <el-form-item label="Name"
                    prop="name">
        <el-input v-model="adminForm.name"/>
      </el-form-item>
      <el-form-item label="Password"
                    prop="password">
        <el-input type="password" v-model="adminForm.password"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
                   @click="submitAdmin(adminFormRef)">
          Confirm
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>

</style>
