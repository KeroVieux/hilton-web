import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCurrentGuest = defineStore('currentGuest', () => {
	const currentGuest = ref(null)

	return { currentGuest }
})
