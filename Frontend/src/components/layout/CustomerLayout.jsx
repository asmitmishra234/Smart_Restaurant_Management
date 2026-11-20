import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useAppSelector } from '../../app/hooks.js'
import { getCustomerSession } from '../../utils/customerSession.js'
import WaiterRequestDialog from '../common/WaiterRequestDialog.jsx'

export default function CustomerLayout() {
  useLocation()
  const [, setSessionVersion] = useState(0)
  const [requestOpen, setRequestOpen] = useState(false)
  const session = getCustomerSession()
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((total, item) => total + item.quantity, 0),
  )

  useEffect(() => {
    const refreshSession = () => setSessionVersion((version) => version + 1)
    window.addEventListener('restoflow:table-session', refreshSession)
    return () =>
      window.removeEventListener('restoflow:table-session', refreshSession)
  }, [])

  return (
    <div className="min-h-screen bg-canvas text-ink-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/menu" className="flex items-center gap-3">
            <img src="/favicon.svg" alt="" className="size-10 rounded-xl" />
            <span>
              <span className="block text-sm font-bold text-ink-950">RestoFlow</span>
              <span className="hidden text-[11px] text-slate-500 sm:block">
                Every Order. Every Table. One Flow.
              </span>
            </span>
          </Link>
          <nav aria-label="Customer navigation" className="flex items-center gap-2">
            {session?.tableNumber && (
              <span className="hidden rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 sm:inline-flex">
                Table {session.tableNumber}
              </span>
            )}
            <Link
              to="/order-tracking"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:inline-flex"
            >
              Track order
            </Link>
            <Link
              to="/bill"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:inline-flex"
            >
              Bill
            </Link>
            <button
              type="button"
              onClick={() => setRequestOpen(true)}
              disabled={!session?.sessionToken}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="hidden sm:inline">Request help</span>
              <span className="sm:hidden">Help</span>
            </button>
            <Link
              to="/cart"
              aria-label={`Cart, ${cartCount} items`}
              className="relative flex size-10 items-center justify-center rounded-xl bg-ink-950 text-white transition hover:bg-slate-800"
            >
              <ShoppingBag aria-hidden="true" className="size-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet context={{ session }} />
      </main>
      <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-xs text-slate-400">
        RestoFlow · Every Order. Every Table. One Flow.
      </footer>
      <WaiterRequestDialog
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        session={session}
      />
    </div>
  )
}
