import { createElement } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Armchair,
  ChartNoAxesCombined,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MessageSquareText,
  Package,
  Tags,
  UsersRound,
  X,
} from 'lucide-react'

const navigation = [
  {
    label: 'Workspace',
    items: [{ label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Orders', to: '/admin/orders', icon: ClipboardList, badge: 'orders' },
      { label: 'Tables', to: '/admin/tables', icon: Armchair },
      { label: 'Payments', to: '/admin/payments', icon: CreditCard },
    ],
  },
  {
    label: 'Menu',
    items: [
      { label: 'Products', to: '/admin/products', icon: Package },
      { label: 'Categories', to: '/admin/categories', icon: Tags },
    ],
  },
  {
    label: 'Business',
    items: [
      { label: 'Staff', to: '/admin/staff', icon: UsersRound },
      { label: 'Reports', to: '/admin/reports', icon: ChartNoAxesCombined },
      { label: 'Feedback', to: '/admin/feedback', icon: MessageSquareText },
    ],
  },
]

export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onClose,
  onToggleCollapse,
}) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/35 md:hidden"
        />
      )}
      {createElement(
        motion.aside,
        {
          initial: false,
          animate: { width: collapsed ? 88 : 256 },
          transition: { duration: 0.2, ease: 'easeInOut' },
          className: `fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`,
        },
        <>
          <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/favicon.svg" alt="" className="size-10 shrink-0 rounded-xl" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold tracking-tight text-ink-950">
                  RestoFlow
                </p>
                <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  Every order. One flow.
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 md:hidden"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <nav aria-label="Main navigation" className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {navigation.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map(({ label, to, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    title={collapsed ? label : undefined}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-ink-950'} ${collapsed ? 'justify-center' : ''}`
                    }
                  >
                    {createElement(Icon, {
                      'aria-hidden': true,
                      className: 'size-[18px] shrink-0',
                    })}
                    {!collapsed && <span>{label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-emerald-800">
                Restaurant is running smoothly
              </span>
            </div>
          )}
          <button
            type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={onToggleCollapse}
            className="hidden min-h-10 w-full items-center justify-center gap-2 rounded-xl text-sm text-slate-500 transition hover:bg-slate-100 hover:text-ink-950 md:flex"
          >
            <ChevronLeft
              aria-hidden="true"
              className={`size-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && <span>Collapse menu</span>}
          </button>
          </div>
        </>,
      )}
    </>
  )
}
