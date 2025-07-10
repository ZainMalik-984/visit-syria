'use client'

import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import api from '@/_lib/axios/axios'
import { AppDispatch, RootState } from '@/_lib/store/store'
import { logout } from '@/_lib/store/slices/authSlice'

const Header = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const { isAuthenticated, email } = useSelector((s: RootState) => s.auth) as { 
    isAuthenticated: boolean; 
    email: string | null 
  }

  /* ----------------  handlers  ---------------- */
  const handleLogout = async () => {
    try {
      await api.post('/user/logout/')
      dispatch(logout())
      router.push('/')
    } catch (err) {
      console.error('Logout failed: ', err)
    }
  }

  const handleAuthToggle = () =>
    isAuthenticated ? handleLogout() : router.push('/')

  /* ----------------  ui  ---------------- */
  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ---------- Brand ---------- */}
        <Link
          href="/"
          className="group flex items-center space-x-2 text-xl font-black tracking-tight text-blue-600 dark:text-blue-400 md:text-2xl transition-all duration-200 hover:scale-105"
        >
          <span className="text-2xl group-hover:animate-pulse">🧠</span>
          <div className="flex flex-col">
            <span className="leading-none">Syria</span>
            <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Multi-Service Booking
            </span>
          </div>
        </Link>

        {/* ---------- Right side ---------- */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notification */}
          <button
            aria-label="Notifications"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition-all duration-200 hover:bg-zinc-100 hover:text-blue-600 hover:scale-110 active:scale-95 dark:text-zinc-300 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
              3
            </span>
          </button>

          {/* Avatar */}
          {isAuthenticated && (
            <div className="group relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-violet-600 text-sm font-bold text-white shadow-lg ring-2 ring-blue-400/50 dark:ring-violet-500/50 transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer">
                {email ? email[0].toUpperCase() : 'U'}
              </div>
              {/* Tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {email}
              </div>
            </div>
          )}

          {/* Login / Logout */}
          <button
            onClick={handleAuthToggle}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="relative z-10">
              {isAuthenticated ? 'Logout' : 'Login'}
            </span>
            {/* Ripple effect */}
            <span className="absolute inset-0 h-full w-full scale-0 rounded-full bg-white/20 transition-transform duration-300 group-active:scale-100" />
            {/* Shimmer effect */}
            <span className="absolute inset-0 -skew-x-12 translate-x-[-200%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[200%]" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
