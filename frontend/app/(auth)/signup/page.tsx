/* -------------------------------------------------
 *  app/(auth)/signup/page.tsx
 * -------------------------------------------------*/
'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import api from '@/_lib/axios/axios'
import { loginSuccess } from '@/_lib/store/slices/authSlice'
import type { AppDispatch } from '@/_lib/store/store'

type Role = 'supplier' | 'customer'
type Step = 'signup' | 'verify-otp'

export default function SignUp() {
  const router   = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  /* ――― state ―――― */
  const [step, setStep]   = useState<Step>('signup')
  const [showPwd, setShowPwd] = useState(false)

  const [form, setForm] = useState({
    firstName : '',
    lastName  : '',
    email     : '',
    password  : '',
    role      : 'customer' as Role,
  })
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [info,    setInfo]    = useState<string | null>(null)

  /* ――― handlers ――― */
  const onChange =
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [e.target.name]: e.target.value })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    try {
      setLoading(true)
      await api.post('/user/registeration/', {
        first_name: form.firstName,
        last_name : form.lastName,
        email     : form.email,
        password  : form.password,
        role      : form.role,
      })
      setInfo('Account created! Check your email for a 6-digit code.')
      setStep('verify-otp')
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      await api.post('/user/verify-otp/', { email: form.email, otp })
      await api.post('/user/login/',      { email: form.email, password: form.password })
      dispatch(loginSuccess({ role: form.role, email: form.email }))
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Invalid / expired OTP')
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    try {
      setLoading(true)
      await api.post('/user/resend-otp/', { email: form.email })
      setInfo('OTP resent. Please check your inbox.')
    } catch {
      setError('Could not resend OTP. Try again later.')
    } finally {
      setLoading(false)
    }
  }

  /* ――― UI ――― */
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white/80 dark:bg-zinc-800/75 backdrop-blur shadow-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 p-8 space-y-8 animate-fadeIn">
        {/* progress bar */}
        <Progress step={step} />

        {/* signup */}
        {step === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5">
            <h1 className="text-center text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              Create an account
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={onChange}
              />
              <Input
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={onChange}
              />
            </div>

            <Input
              type="email"
              name="email"
              placeholder="Email address"
              value={form.email}
              onChange={onChange}
            />

            {/* password with toggle */}
            <div className="relative">
              <Input
                type={showPwd ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={onChange}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-indigo-500"
              >
                {showPwd ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>

            {/* role segmented control */}
            <div className="flex items-center justify-center gap-3">
              {(['customer', 'supplier'] as Role[]).map(r => (
                <label
                  key={r}
                  className={`flex-1 cursor-pointer rounded-lg border px-4 py-2 text-center text-sm font-medium transition
                    ${form.role === r
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white/80 dark:bg-zinc-700/40 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={onChange}
                    className="sr-only"
                  />
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </label>
              ))}
            </div>

            <Button loading={loading}>Sign up</Button>
          </form>
        )}

        {/* otp */}
        {step === 'verify-otp' && (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Verify your email
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Enter the six-digit code sent to <span className="font-medium">{form.email}</span>
              </p>
            </div>

            <Input
              type="text"
              placeholder="·  ·  ·  ·  ·  ·"
              className="tracking-[0.4em] text-center text-xl font-semibold"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />

            <Button loading={loading} disabled={otp.length !== 6}>
              Verify & login
            </Button>

            <button
              type="button"
              onClick={resendOTP}
              disabled={loading}
              className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Resend code
            </button>
          </form>
        )}

        {/* alerts */}
        {error && <Alert color="red">{error}</Alert>}
        {info  && <Alert color="green">{info}</Alert>}

        {/* link */}
        <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
          Already registered?{' '}
          <span
            className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            onClick={() => router.push('/login')}
          >
            Sign in
          </span>
        </p>
      </div>
    </main>
  )
}

/* ------------- small reusable UI bits ---------------- */

function Progress({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {(['signup', 'verify-otp'] as Step[]).map((s, i) => {
        const active = step === s || (step === 'verify-otp' && s === 'signup')
        return (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`grid h-9 w-9 place-items-center rounded-full
                ${active ? 'bg-indigo-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'}
              `}
            >
              {active && step === s ? i+1 : active ? <Check size={18}/> : i+1}
            </div>
            {i === 0 && (
              <div
                className={`h-1 w-16 rounded-full transition
                  ${step === 'verify-otp' ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white/70 dark:bg-zinc-800 px-4 py-2 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${props.className ?? ''}`}
    />
  )
}

function Button(
  { children, loading, disabled }: { children: React.ReactNode; loading?: boolean; disabled?: boolean }
) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`relative w-full rounded-lg bg-indigo-600 py-2 text-center font-medium text-white transition
        hover:bg-indigo-700 active:scale-[.98] disabled:opacity-50
      `}
    >
      {loading && (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  )
}

function Alert({ children, color }: { children: React.ReactNode; color: 'red' | 'green' }) {
  const clr = color === 'red' ? 'red' : 'green'
  return (
    <div className={`rounded-lg border border-${clr}-200 dark:border-${clr}-800 bg-${clr}-50 dark:bg-${clr}-900/20 p-3`}>
      <p className={`text-sm text-${clr}-600 dark:text-${clr}-400 text-center`}>{children}</p>
    </div>
  )
}

/* animation util */
declare global {
  /* eslint-disable-next-line no-var */
  var styleAdded: boolean
}
if (typeof window !== 'undefined' && !globalThis.styleAdded) {
  const style = document.createElement('style')
  style.innerHTML = `
    @keyframes fadeIn { from {opacity:0;transform:translateY(8px)} to {opacity:1;transform:none} }
    .animate-fadeIn { animation: fadeIn .6s ease-out both }
  `
  document.head.appendChild(style)
  globalThis.styleAdded = true
}
