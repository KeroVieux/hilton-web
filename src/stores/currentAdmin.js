import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCurrentAdmin = defineStore('currentAdmin', () => {
	const currentAdmin = ref(null)

	return { currentAdmin }
})
