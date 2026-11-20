import { createElement, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, ChevronDown, Menu, UserRound } from 'lucide-react'

function getInitials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'RF'
  )
}

export default function Header({
  title,
  description,
  onMenuClick,
  user,
  onLogout,
  notificationCount = 0,
}) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const profileRef = useRef(null)
  const notificationsRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) setProfileOpen(false)
      if (!notificationsRef.current?.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false)
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 md:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-ink-950 sm:text-xl">
            {title}
          </h1>
          {description && (
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            aria-label={`Notifications${notificationCount ? `, ${notificationCount} unread` : ''}`}
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((open) => !open)
              setProfileOpen(false)
            }}
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-ink-950"
          >
            <Bell aria-hidden="true" className="size-[18px]" />
            {notificationCount > 0 && (
              <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-brand-600" />
            )}
          </button>
          <AnimatePresence>
            {notificationsOpen &&
              createElement(
                motion.div,
                {
                  initial: { opacity: 0, y: 5, scale: 0.98 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  exit: { opacity: 0, y: 5, scale: 0.98 },
                  className:
                    'absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl',
                },
                <>
                  <p className="text-sm font-semibold text-ink-950">
                    Notifications
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Live updates will appear here.
                  </p>
                </>,
              )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            aria-expanded={profileOpen}
            aria-label="Open profile menu"
            onClick={() => {
              setProfileOpen((open) => !open)
              setNotificationsOpen(false)
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 text-left transition hover:bg-slate-50"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {getInitials(user?.name)}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block max-w-32 truncate text-xs font-semibold text-ink-950">
                {user?.name ?? 'RestoFlow team'}
              </span>
              <span className="block text-[11px] text-slate-500">
                {user?.role ?? 'Staff workspace'}
              </span>
            </span>
            <ChevronDown aria-hidden="true" className="hidden size-4 text-slate-400 sm:block" />
          </button>
          <AnimatePresence>
            {profileOpen &&
              createElement(
                motion.div,
                {
                  initial: { opacity: 0, y: 5, scale: 0.98 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  exit: { opacity: 0, y: 5, scale: 0.98 },
                  className:
                    'absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl',
                },
                <>
                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <span className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <UserRound aria-hidden="true" className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink-950">
                        {user?.name ?? 'RestoFlow team'}
                      </span>
                      <span className="block truncate text-xs text-slate-500">
                        {user?.email ?? 'Signed-in workspace'}
                      </span>
                    </span>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      Sign out
                    </button>
                  )}
                </>,
              )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
