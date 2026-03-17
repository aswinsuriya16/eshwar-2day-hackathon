import axios from 'axios'

const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const normalized = rawBase.replace(/\/+$/, '')

export const api = axios.create({
  baseURL: `${normalized}/api`,
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export function getErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong. Please try again.'
  )
}

