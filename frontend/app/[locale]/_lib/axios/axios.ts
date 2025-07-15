'use client'

import axios from 'axios'

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/`,
  withCredentials: true,
})

// Setup interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      (error.response?.status === 401) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/user/token/refresh/`,
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
