'use client'

import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  withCredentials: true,
})

// Setup interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      try {
        await axios.post(
          'http://127.0.0.1:8000/api/user/token/refresh/',
          {},
          { withCredentials: true }
        )
        return api(originalRequest)
      } catch (refreshError) {
        // Manual redirection in component
        if (typeof window !== 'undefined') {
          window.location.href = '/login' // or any login/logout route
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
