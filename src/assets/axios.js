import axios from 'axios'

export const $axios = () => {
	return axios.create({
		baseURL: `${import.meta.env.VITE_LB_BASE_URL}`,
	})
}
