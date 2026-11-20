import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import Input from '../../components/common/Input.jsx'
import { login } from '../../features/auth/authSlice.js'
import { getRoleHome } from '../../utils/roleHome.js'

export default function Login() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { authStatus, isLoading, user } = useAppSelector((state) => state.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  if (authStatus === 'authenticated' && user) {
    return <Navigate to={getRoleHome(user.role)} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const currentUser = await dispatch(login(form)).unwrap()
      toast.success(`Welcome to RestoFlow, ${currentUser.name}.`)
      const destination =
        location.state?.from?.pathname ?? getRoleHome(currentUser.role)
      navigate(destination, { replace: true })
    } catch (error) {
      toast.error(error?.message ?? 'Unable to sign in. Please try again.')
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f8f6] px-4 py-10 sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-32 size-80 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute -bottom-36 -right-20 size-96 rounded-full bg-amber-100/50 blur-3xl" />
      </div>
      <section className="relative z-10 w-full max-w-[440px]">
        <div className="mb-7 flex flex-col items-center text-center">
          <img
            src="/favicon.svg"
            alt=""
            className="mb-4 size-14 rounded-2xl shadow-sm"
          />
          <Link to="/" className="text-2xl font-bold tracking-tight text-ink-950">
            RestoFlow
          </Link>
          <p className="mt-1 text-sm text-slate-500">
            Every Order. Every Table. One Flow.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_70px_-35px_rgba(32,39,37,0.28)] sm:p-9">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
              Restaurant workspace
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-950">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in with your admin or staff account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              autoComplete="username"
              placeholder="you@restaurant.com"
              leadingIcon={Mail}
              required
              value={form.email}
              onChange={(event) =>
                setForm((value) => ({ ...value, email: event.target.value }))
              }
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              leadingIcon={LockKeyhole}
              required
              value={form.password}
              onChange={(event) =>
                setForm((value) => ({ ...value, password: event.target.value }))
              }
              trailingContent={
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                  className="rounded-md p-1 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              }
            />
            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Access is managed by your restaurant administrator. There is no
            public registration.
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Secure staff access · RestoFlow
        </p>
      </section>
    </main>
  )
}
