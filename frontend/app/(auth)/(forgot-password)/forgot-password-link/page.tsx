/* -------------------------------------------------
 *  app/(auth)/forgot-password/page.tsx
 * -------------------------------------------------*/
'use client'

import { Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/_lib/axios/axios'           // ← your axios instance

api.defaults.withCredentials = true           // keep cookies if any

export default function ForgotPassword() {
  const router = useRouter()

  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      await api.post('/user/password-reset/', { email })   // ← adjust URL
      setSent(true)
    } catch (err: any) {
      setError(
        err.response?.data?.detail ??
        'Something went wrong. Please try again later.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white/80 dark:bg-zinc-800/75 backdrop-blur shadow-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 p-8 animate-fadeIn">

        {/* icon */}
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-white">
          <Mail size={28}/>
        </div>

        {/* title */}
        <h1 className="text-center text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
          Forgot password
        </h1>

        {/* content */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
              Enter your account e-mail and we’ll send you a reset link.
            </p>

            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white/70 dark:bg-zinc-800 px-4 py-2 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="relative w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 active:scale-[.98] disabled:opacity-50"
            >
              {loading && (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
              Send reset link
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-sm text-green-600 dark:text-green-400">
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
            </p>
            <button
              className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 active:scale-[.98]"
              onClick={() => router.push('/login')}
            >
              Back to sign-in
            </button>
          </div>
        )}

        {/* error alert */}
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* nav link */}
        {!sent && (
          <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
            Remembered it?{' '}
            <span
              onClick={() => router.push('/login')}
              className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Go to sign-in
            </span>
          </p>
        )}
      </div>

      {/* fade-in util */}
      <style jsx>{`
        @keyframes fadeIn { from {opacity:0; transform:translateY(8px)} to {opacity:1} }
        .animate-fadeIn { animation: fadeIn .5s ease-out both }
      `}</style>
    </main>
  )
}
