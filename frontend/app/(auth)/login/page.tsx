/* app/(auth)/login/page.tsx – no localStorage, uses cookies */
'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import api from '@/_lib/axios/axios'
import { loginSuccess } from '@/_lib/store/slices/authSlice'
import type { AppDispatch } from '@/_lib/store/store'

/* Tell axios to always send / receive cookies */
api.defaults.withCredentials = true

type Phase = 'login' | 'verify-otp'

export default function LoginPage() {
  const router   = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const [phase, setPhase] = useState<Phase>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  /* ---------- login ---------- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setInfo(null)

    try {
      setLoading(true)
      const { data } = await api.post('/user/login/', { email, password })

      /* Inactive account → OTP step */
      if (data.requires_verification) {
        setPhase('verify-otp')
        setInfo(data.message)
        return
      }

      /* Active user → redux save + redirect
         Tokens are already in HttpOnly cookies – nothing to store */
      dispatch(loginSuccess({ role: data.user.role, email: data.user.email }))
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.errors?.non_field_errors?.[0] ?? 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  /* ---------- OTP verify ---------- */
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setInfo(null)

    try {
      setLoading(true)
      await api.post('/user/verify-otp/', { email, otp })
      /* Auto-login immediately after OTP */
      await api.post('/user/login/', { email, password })

      dispatch(loginSuccess({ role: 'customer', email }))       // role isn’t in this response; adapt as needed
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'OTP invalid or expired')
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = () =>
    api.post('/user/resend-otp/', { email }).then(() => setInfo('OTP resent!'))

  /* ---------- UI (unchanged styling) ---------- */
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black px-4">
      <div className="w-full max-w-lg space-y-8 rounded-2xl bg-white/80 dark:bg-zinc-800/75 backdrop-blur shadow-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 p-8 animate-fadeIn">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-white">
          <ShieldCheck size={28}/>
        </div>

        {phase === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <h1 className="text-center text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">Sign in</h1>

            <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} required />

            <div className="relative">
              <Input
                type={showPwd ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-indigo-500">
                {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            <Button loading={loading}>Login</Button>

            <div className="text-right">
              <span onClick={() => router.push('/forgot-password-otp')}
                className="mr-3 cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Forgot password with otp?
              </span>
              <span onClick={() => router.push('/forgot-password-link')}
                className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
                Forgot password with link?
              </span>
            </div>
          </form>
        )}

        {phase === 'verify-otp' && (
          <form onSubmit={handleVerify} className="space-y-6">
            <h2 className="text-center text-2xl font-bold text-indigo-600 dark:text-indigo-400">Verify your account</h2>
            <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              Enter the 6-digit code sent to <span className="font-medium">{email}</span>
            </p>

            <Input
              placeholder="· · · · · ·"
              maxLength={6}
              className="tracking-[0.4em] text-center text-xl font-semibold"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
            />

            <Button loading={loading} disabled={otp.length !== 6}>Verify & login</Button>

            <button type="button" onClick={resendOTP}
              className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              Resend code
            </button>
          </form>
        )}

        {error && <Alert color="red">{error}</Alert>}
        {info  && <Alert color="green">{info}</Alert>}

        <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
          No account?{' '}
          <span onClick={() => router.push('/signup')}
            className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
            Create one
          </span>
        </p>
      </div>
    </main>
  )
}

/* --- helpers (unchanged) --- */
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input {...props}
      className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white/70 dark:bg-zinc-800 px-4 py-2 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className ?? ''}`} />
  )
}
function Button({ children, loading, disabled }: { children: React.ReactNode; loading?: boolean; disabled?: boolean }) {
  return (
    <button type="submit" disabled={disabled || loading}
      className="relative w-full rounded-lg bg-indigo-600 py-2 text-white font-medium transition hover:bg-indigo-700 active:scale-[.98] disabled:opacity-50">
      {loading && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
function Alert({ children, color }: { children: React.ReactNode; color: 'red'|'green' }) {
  const style = color === 'red'
    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 text-green-600 dark:text-green-400'
  return <div className={`rounded-lg border p-3 text-center text-sm ${style}`}>{children}</div>
}
