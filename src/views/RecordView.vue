<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import qs from 'qs'
import store from 'store'
import {$axios} from "@/assets/axios";
import Reservation from "@/components/Reservation.vue";

const circleUrl = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
const statusText = ['Canceled', 'Waiting for Confirm', 'Confirmed', 'Completed']
const currentGuest = ref(store.get('guest'))
const currentAdmin = ref(store.get('admin'))
const changeNameVisible = ref(false)
const updateReservationVisible = ref(false)
const guestNameFormRef = ref()
const currentReservation = ref()
const reservations = ref([])
const queryForm = ref({
  status: 'all',
  date: dayjs(),
})
const guestNameForm = ref({
  name: '',
  phone: '',
})
const rules = ref({
  name: [
    {required: true, message: 'Please input a name', trigger: 'blur'},
    {min: 3, max: 20, message: 'Length should be 3 to 5', trigger: 'blur'},
  ],
  phone: [
    {required: true, message: 'Please input a phone number', trigger: 'blur'},
    {min: 6, max: 20, message: 'Length should be 6 to 20', trigger: 'blur'},
  ],
})
const fetchReservations = async (extraCondition) => {
  let filter = {
    where: {
      name: currentGuest.value?.name,
      phone: currentGuest.value?.phone,
    },
    include: ['restaurant', 'table'],
    order: ['expectedAt DESC'],
    limit: 100,
  }
  if (currentAdmin.value) {
    filter = {
      ...filter,
      where: {
        restaurantId: currentAdmin.value.restaurantId,
        ...extraCondition,
      },
    }
  }
  const { data } = await $axios().get(`reservations?${qs.stringify({
    filter,
  }, {
    encodeValuesOnly: true,
  })}`)
  reservations.value = data
}
const submitGuestName = async(formEl) =>{
  await formEl.validate( async (valid, fields) => {
    if (valid) {
      store.set('guest', {
        name: guestNameForm.value.name,
        phone: guestNameForm.value.phone,
      })
      currentGuest.value = {
        name: guestNameForm.value.name,
        phone: guestNameForm.value.phone,
      }
      await fetchReservations()
      ElMessage({
        message: 'Your name is changed',
        type: 'success',
      })
      changeNameVisible.value = false
      guestNameForm.value = {
        name: '',
        phone: '',
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
const setCurrentReservation = async (reservation) => {
  currentReservation.value = { ...reservation }
  updateReservationVisible.value = true
}
const updateStatus = async (id, targetStatus) => {
  await $axios().patch(`reservations/${id}`, {
    status: targetStatus
  })
  await fetchReservations()
}
const afterUpdate = async () => {
  updateReservationVisible.value = false
  await fetchReservations()
}
const handleQuery = async () => {
  const extra = {}
  if (queryForm.value.status !== 'all') {
    extra.status = queryForm.value.status
  }
  if (queryForm.value.date) {
    extra.expectedAt = {
      gt: dayjs(queryForm.value.date).startOf('d').toISOString(),
      lt: dayjs(queryForm.value.date).endOf('d').toISOString(),
    }
  }
  console.log('extra', extra)
  await fetchReservations(extra)
}
onMounted(async () => {
  currentAdmin.value = store.get('admin')
  await fetchReservations()
})
</script>

<template>
  <div>
    <el-dialog
        v-model="updateReservationVisible"
        title="Update Reservation"
    >
      <Reservation mode="updating" :currentReservation="currentReservation" @afterUpdate="afterUpdate"></Reservation>
    </el-dialog>
    <el-dialog
        v-model="changeNameVisible"
        title="Change Your Name"
        width="30%"
    >
      <div>
        <el-form
            label-position="top"
            ref="guestNameFormRef"
            :model="guestNameForm"
            :rules="rules"
            label-width="120px"
            status-icon
        >
          <el-form-item label="Name"
                        prop="name">
            <el-input v-model="guestNameForm.name"/>
          </el-form-item>
          <el-form-item label="Phone number"
                        prop="phone">
            <el-input v-model="guestNameForm.phone"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
                       @click="submitGuestName(guestNameFormRef)">
              Confirm
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-dialog>
    <header class="mb-20">
      <div class="flex" v-if="!currentAdmin">
        <el-avatar :size="30" :src="circleUrl" />
        <div class="pl-10">{{ currentGuest?.name }}</div>
        <div class="pl-10">
          <el-button type="primary" link size="small" @click="changeNameVisible = true">{{ currentGuest?.name ? 'This is not me' : 'Set a guest name' }}</el-button>
        </div>
      </div>
      <div v-else>
        <div>{{ currentAdmin.restaurant.name }}</div>
        <div class="text-12 text-gray-500">{{ currentAdmin.restaurant.remark }}</div>
      </div>
    </header>
    <div class="mb-20" v-if="currentAdmin">
      <el-form :inline="true" :model="queryForm">
        <el-form-item label="Status">
          <el-select
              v-model="queryForm.status"
          >
            <el-option
                       label="all"
                       value="all" />
            <el-option v-for="(item, index) in statusText"
                       :label="item"
                       :value="index" />
          </el-select>
        </el-form-item>
        <el-form-item label="Date">
          <el-date-picker
              v-model="queryForm.date"
              type="date"
              placeholder="Pick a date"
              clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">Query</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-card class="mb-10" v-for="item in reservations" :key="item._id">
      <template #header>
        <div class="flex justify-between">
          <div v-if="!currentAdmin">
            <div>{{ item.restaurant.name }}</div>
            <div class="text-12 text-gray-500">{{ item.restaurant.remark }}</div>
          </div>
          <div v-else>
            <div>{{ item.name }}</div>
            <div class="text-12 text-gray-500">{{ item.phone }}</div>
          </div>
          <div>
            <el-button-group v-if="dayjs().add(15, 'm').valueOf() < dayjs(item.expectedAt).valueOf() && item.status">
              <el-popconfirm
                  v-if="item.status === 1 && currentAdmin"
                  @confirm="updateStatus(item._id, 2)"
                  title="Are you sure to confirm this?">
                <template #reference>
                  <el-button size="small" type="success" text >Confirm</el-button>
                </template>
              </el-popconfirm>
              <el-popconfirm
                  v-if="item.status === 2 && currentAdmin"
                  @confirm="updateStatus(item._id, 3)"
                  title="Are you sure to Complete this?">
                <template #reference>
                  <el-button size="small" type="success" text >Complete</el-button>
                </template>
              </el-popconfirm>
              <el-button v-if="item.status !== 3" size="small" type="warning" text @click="setCurrentReservation(item)">Update</el-button>
              <el-popconfirm
                  v-if="item.status !== 3"
                  @confirm="updateStatus(item._id, 0)"
                  title="Are you sure to cancel this?">
                <template #reference>
                  <el-button size="small" type="danger" text >Cancel</el-button>
                </template>
              </el-popconfirm>
            </el-button-group>
          </div>
        </div>
      </template>
      <div>
        <div class="mb-10">
          <div>Status</div>
          <div class="text-14">{{statusText[item.status]}} <el-tag class="ml-2" type="danger" v-if="dayjs().add(15, 'm').valueOf() > dayjs(item.expectedAt).valueOf()">Expired</el-tag></div>
        </div>
        <div class="mb-10">
          <div>Table</div>
          <div class="text-14 text-gray-500">{{item.table.name}}, {{item.table.min}} - {{item.table.max}} people, {{item.table.remark}}</div>
        </div>
        <div class="mb-10">
          <div>Arrive Time</div>
          <div class="text-14 text-gray-500">{{dayjs(item.expectedAt).format('YYYY-MM-DD HH:mm')}}</div>
        </div>
        <div class="mb-10">
          <div>Updated Time</div>
          <div class="text-14 text-gray-500">{{dayjs(item.updatedAt).format('YYYY-MM-DD HH:mm')}}</div>
        </div>
        <div class="mb-10">
          <div>Created Time</div>
          <div class="text-14 text-gray-500">{{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}}</div>
        </div>
        <div v-if="item.remark">
          <div>Remark</div>
          <div class="text-14 text-gray-500">{{item.remark}}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>

</style>
