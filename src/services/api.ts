import axios from 'axios'
import auth from '@react-native-firebase/auth'
import { API_URL } from '@/constants'

const api = axios.create({
  baseURL: `${API_URL}/v1`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await auth().currentUser?.getIdToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const token = await auth().currentUser?.getIdToken(true)
      if (token) {
        error.config.headers.Authorization = `Bearer ${token}`
        return api.request(error.config)
      }
    }
    return Promise.reject(error)
  },
)

export default api
