'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react'
import api from '@/_lib/axios/axios'
import { useTranslations } from 'next-intl'; // Added for translations

api.defaults.withCredentials = true   // keep cookies if any

export default function ResetPasswordPage() {
  const t = useTranslations('resetPassword'); // Namespace to 'resetPassword' in JSON
  const router          = useRouter()
  const { uid, token }  = useParams<{ uid: string; token: string }>()

  const [pwd1, setPwd1]     = useState('')
  const [pwd2, setPwd2]     = useState('')
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [done,  setDone]      = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwd1 !== pwd2) {
      setError(t('passwordMismatch')) // Translated mismatch error
      return
    }

    setError(null)
    try {
      setLoading(true)
      console.log(pwd1, pwd2, uid, token) // Debugging line to check values
      await api.post('/user/password-reset-confirm/', {
        uid, token, password: pwd1,     //  ← adjust payload names to your backend
      })
      setDone(true)
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Link expired or invalid')
    } finally {
      setLoading(false)
    }
  }

  /* ------------- UI ------------- */
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black px-4">
      <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white/80 dark:bg-zinc-800/75 backdrop-blur shadow-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 p-8 animate-fadeIn">

        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-white">
          <KeyRound size={28}/>
        </div>

        {!done ? (
          <>
            <h1 className="text-center text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {t('title')}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* password */}
              <div className="relative">
                <Input
                  type={show ? 'text' : 'password'}
                  placeholder={t('newPasswordPlaceholder')}
                  value={pwd1}
                  onChange={e => setPwd1(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-indigo-500"
                >
                  {show ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>

              {/* confirm */}
              <Input
                type={show ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                value={pwd2}
                onChange={e => setPwd2(e.target.value)}
                required
              />

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full rounded-lg bg-indigo-600 py-2 text-white font-medium transition hover:bg-indigo-700 active:scale-[.98] disabled:opacity-50"
              >
                {loading && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                {t('saveButton')}
              </button>
            </form>
          </>
        ) : (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
              {t('successTitle')}
            </h2>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700"
            >
              {t('successButton')}
            </button>
          </div>
        )}

        {/* error alert */}
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
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

/* small Input helper */
function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }
) {
  return (
    <input {...props}
      className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white/70 dark:bg-zinc-800 px-4 py-2 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className ?? ''}`} />
  )
}
