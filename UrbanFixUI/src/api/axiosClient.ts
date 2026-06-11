import axios from 'axios'
import {
  clearAuthSession,
  getAccessToken,
  setAuthMessage,
} from '../lib/auth'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5200',
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      window.location.pathname.startsWith('/admin') &&
      window.location.pathname !== '/admin/login'
    ) {
      clearAuthSession()
      setAuthMessage('Sesja wygasła albo nie jesteś zalogowany jako administrator.')
      window.location.assign('/admin/login')
    }

    return Promise.reject(error)
  },
)
