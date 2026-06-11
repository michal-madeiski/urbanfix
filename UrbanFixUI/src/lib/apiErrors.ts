import axios from 'axios'

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function isConflictError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 409
}
