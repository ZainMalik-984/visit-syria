'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react'
import api from '@/_lib/axios/axios'
import { useTranslations } from 'next-intl'; // Added for translations

api.defaults.withCredentials = true   // keep any auth cookies

export default function VerifyResetOTP() {
  const t = useTranslations('forgotPasswordOtpVerify'); // Namespace to 'forgotPasswordOtpVerify' in JSON
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const email         = searchParams.get('email') || ''

  /* redirect back if no e-mail */
  useEffect(() => { if (!email) router.replace('/forgot-password-otp') }, [email, router])

  const [otp,  setOtp]  = useState('')
  const [pwd1, setPwd1] = useState('')
  const [pwd2, setPwd2] = useState('')
  const [show, setShow] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [done,    setDone]    = useState(false)

  /* ---- submit ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwd1 !== pwd2) { setError(t('passwordMismatch')); return }
    setError(null)

    try {
      setLoading(true)
      await api.post('/user/password-reset-verify/', {
        email, otp, password: pwd1      /* adjust field names if needed */
      })
      setDone(true)
    } catch (err: any) {
      setError(
        err.response?.data?.detail
        ?? err.response?.data?.error
        ?? 'Invalid or expired code'
      )
    } finally {
      setLoading(false)
    }
  }

  /* ---- resend ---- */
  const resend = () =>
    api.post('/user/send-reset-otp/', { email }).then(() => setError('New code sent!'))

  /* ------------------------------------------------------------ */
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black px-4">
      <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white/80 dark:bg-zinc-800/75 backdrop-blur shadow-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 p-8 animate-fadeIn">

        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-white">
          <KeyRound size={28}/>
        </div>

        {!done ? (
          <>
            <h1 className="text-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {t('title')}
            </h1>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              {t('description', { email })} {/* Dynamic interpolation */}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                placeholder={t('otpPlaceholder')}
                maxLength={6}
                className="tracking-[0.4em] text-center text-xl font-semibold"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
              />

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

              <Input
                type={show ? 'text' : 'password'}
                placeholder={t('confirmPasswordPlaceholder')}
                value={pwd2}
                onChange={e => setPwd2(e.target.value)}
                required
              />

              <Button loading={loading} disabled={otp.length !== 6}>
                {t('saveButton')}
              </Button>

              <button
                type="button"
                onClick={resend}
                className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {t('resendCode')}
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
              className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 active:scale-[.98]"
            >
              {t('successButton')}
            </button>
          </div>
        )}

        {/* alert */}
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from {opacity:0; transform:translateY(8px)} to {opacity:1} }
        .animate-fadeIn { animation: fadeIn .5s ease-out both }
      `}</style>
    </main>
  )
}

/* ---- tiny helpers (same as earlier pages) ---- */
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input {...props}
      className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white/70 dark:bg-zinc-800 px-4 py-2 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className ?? ''}`} />
  )
}
function Button(
  { children, loading, disabled }: { children: React.ReactNode; loading?: boolean; disabled?: boolean }
) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="relative w-full rounded-lg bg-indigo-600 py-2 text-white font-medium transition hover:bg-indigo-700 active:scale-[.98] disabled:opacity-50"
    >
      {loading && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
