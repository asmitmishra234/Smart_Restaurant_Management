import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import Button from '../components/common/Button.jsx'
import Loader from '../components/common/Loader.jsx'
import { checkAuth } from '../features/auth/authSlice.js'

export default function ProtectedRoute() {
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector((state) => state.auth.authStatus)
  const error = useAppSelector((state) => state.auth.error)
  const location = useLocation()

  if (authStatus === 'unknown' || authStatus === 'checking') {
    return <Loader label="Checking your RestoFlow session" fullScreen />
  }

  if (authStatus === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-ink-950">
            Could not verify your session
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {error ?? 'Check your connection and try again.'}
          </p>
          <Button className="mt-5" onClick={() => dispatch(checkAuth())}>
            Try again
          </Button>
        </section>
      </main>
    )
  }

  if (authStatus !== 'authenticated') {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
