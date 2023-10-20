<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, defineProps, toRefs, defineEmits } from 'vue'
import { ElMessage } from 'element-plus'
import store from 'store'
import dayjs from 'dayjs'
import qs from 'qs'
import {$axios} from '@/assets/axios'

const router = useRouter()
const props = defineProps({
  mode: String,
  currentReservation: Object,
})
const { mode, currentReservation } = toRefs(props)

const emit = defineEmits(['afterUpdate'])

const reservationForm = ref({
  name: '',
  phone: '',
  remark: '',
  expectedAt: '',
  restaurantId: '',
  tableId: '',
})
const rules = ref({
  name: [
    {required: true, message: 'Please input a name', trigger: 'blur'},
    {min: 3, max: 20, message: 'Length should be 3 to 5', trigger: 'blur'},
  ],
  phone: [
    {required: true, message: 'Please input a phone number', trigger: 'blur'},
    {min: 6, max: 20, message: 'Please input a valid number', trigger: 'blur'},
  ],
  expectedAt: [
    {required: true, message: 'Please pick a time', trigger: 'change'},
  ],
  restaurant: [
    {required: true, message: 'Please pick a restaurant', trigger: 'blur'},
  ],
  table: [
    {required: true, message: 'Please pick a table', trigger: 'blur'},
  ],
})
const submitForm = async (formEl) => {
  await formEl.validate( async (valid, fields) => {
    if (valid) {
      const submittingData = {
        ...reservationForm.value,
        expectedAt: dayjs(reservationForm.value.expectedAt).set('hour', timing.value.split(':')[0]).set('minute', timing.value.split(':')[1]).toISOString(),
        updatedAt: dayjs(),
      }
      if (!currentReservation.value) {
        await $axios().post('reservations', {
          ...submittingData,
          createdAt: dayjs(),
        })
        store.set('guest', {
          name: reservationForm.value.name,
          phone: reservationForm.value.phone,
        })
        router.push('/records')
        ElMessage({
          message: 'Reservation is created.',
          type: 'success',
        })
      } else {
        await $axios().patch(`reservations/${currentReservation.value._id}`, {
          ...submittingData,
          status: 1,
        })
        ElMessage({
          message: 'Reservation is updated.',
          type: 'success',
        })
        emit('afterUpdate')
      }
    } else {
      console.log('error submit!', fields)
    }
  })
}
const reservationFormRef = ref()
const restaurants = ref([])
const tables = ref([])
const timingNoon = ref([])
const timingNight = ref([])
const timing = ref('')
const currentGuest = ref(store.get('guest'))
onMounted( async () => {
  const timingNoonInit = dayjs().set('hour', 11).set('minute', 0)
  const timingNoonArray = new Array(5).fill('')
  const timingNightInit = dayjs().set('hour', 17).set('minute', 0)
  const timingNightArray = new Array(8).fill('')
  timingNoon.value = timingNoonArray.map((item, index) => {
    return timingNoonInit.add(index * 30, 'minute').format('HH:mm')
  })
  timingNight.value = timingNightArray.map((item, index) => {
    return timingNightInit.add(index * 30, 'minute').format('HH:mm')
  })
  if (currentReservation.value) {
    const { data: tableData } = await $axios().get(`tables?${qs.stringify({
      restaurant: currentReservation.value.restaurantId,
      status: 1,
    }, {
      encodeValuesOnly: true,
    })}`)
    tables.value = tableData

    timing.value = dayjs(currentReservation.value.expectedAt).format('HH:mm')
    reservationForm.value = {
      name: currentReservation.value.name,
      phone: currentReservation.value.phone,
      remark: currentReservation.value.remark,
      expectedAt: currentReservation.value.expectedAt,
      restaurantId: currentReservation.value.restaurantId,
      tableId: currentReservation.value.tableId,
    }
  } else {
    if (currentGuest) {
      reservationForm.value.name = currentGuest?.value?.name
      reservationForm.value.phone = currentGuest?.value?.phone
    }
    const { data: restaurantData } = await $axios().get(`restaurants?${qs.stringify({
      status: 1,
    }, {
      encodeValuesOnly: true,
    })}`)
    restaurants.value = restaurantData
    reservationForm.value.restaurantId = restaurantData[0]._id

    const { data: tableData } = await $axios().get(`tables?${qs.stringify({
      restaurant: restaurantData[0]._id,
      status: 1,
    }, {
      encodeValuesOnly: true,
    })}`)
    tables.value = tableData
    reservationForm.value.tableId = tableData[0]._id
    reservationForm.value.expectedAt = dayjs().toISOString()

    timing.value = timingNoon.value[0]
  }
})
</script>

<template>
  <el-form
      label-position="top"
      ref="reservationFormRef"
      :model="reservationForm"
      :rules="rules"
      status-icon
  >
    <el-form-item v-if="mode !== 'updating'" label="Restaurant"
                  prop="restaurantId">
      <el-select v-model="reservationForm.restaurantId"
                 style="width: 100%"
                 placeholder="Restaurant name">
        <el-option
            v-for="item in restaurants"
            :key="item._id"
            :label="item.name"
            :value="item._id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="Expected Date" prop="expectedAt">
      <el-date-picker
          v-model="reservationForm.expectedAt"
          style="width: 100%"
          type="date"
          label="Pick a date"
          placeholder="Pick a date"
      />
    </el-form-item>
    <el-form-item label="Arrived At"
                  prop="timing">
      <el-select v-model="timing"
                 style="width: 100%"
                 placeholder="timing">
        <el-option
            v-for="(item, index) in [...timingNoon, ...timingNight]"
            :key="index"
            :label="item"
            :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="Table"
                  prop="tableId">
      <el-select v-model="reservationForm.tableId"
                 style="width: 100%"
                 placeholder="table name">
        <el-option
            v-for="item in tables"
            :key="item._id"
            :label="`${item.name} (${item.min} - ${item.max} people) ${item.remark ? ',' : ''} ${item.remark }`"
            :value="item._id"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="mode !== 'updating'" label="Name"
                  prop="name">
      <el-input id="name" v-model="reservationForm.name"/>
    </el-form-item>
    <el-form-item id="phone" v-if="mode !== 'updating'" label="Phone number"
                  prop="phone">
      <el-input v-model="reservationForm.phone"/>
    </el-form-item>
    <el-form-item label="Remark"
                  prop="remark">
      <el-input v-model="reservationForm.remark"
                type="textarea"/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary"
                 @click="submitForm(reservationFormRef)">
        Confirm
      </el-button>
    </el-form-item>
  </el-form>
</template>
