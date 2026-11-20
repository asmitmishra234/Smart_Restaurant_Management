import { Outlet } from 'react-router-dom'
import { BellRing } from 'lucide-react'

export default function WaiterLayout({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-canvas text-ink-950">
      <header className="flex min-h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="" className="size-10 rounded-xl" />
          <div>
            <p className="text-sm font-bold text-ink-950">RestoFlow</p>
            <p className="text-xs text-slate-500">Service workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 sm:inline-flex">
            <BellRing aria-hidden="true" className="size-3.5" />
            {user?.name ?? 'Waiter team'}
          </span>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Sign out
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
