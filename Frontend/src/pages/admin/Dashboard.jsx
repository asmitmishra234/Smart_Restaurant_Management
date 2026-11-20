import { createElement, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownRight,
  ArrowRight,
  Armchair,
  ChartNoAxesCombined,
  ClipboardList,
  IndianRupee,
  Package,
  Plus,
  RefreshCw,
  UsersRound,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import Button from '../../components/common/Button.jsx'
import { LoadingSkeleton } from '../../components/common/Loader.jsx'
import {
  fetchDashboardOverview,
  selectDashboard,
} from '../../features/dashboard/dashboardSlice.js'
import { formatCurrency, formatDateTime } from '../../utils/formatters.js'

function StatCard({ title, value, icon: Icon, detail, accent = false }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 sm:text-sm">{title}</p>
          <p
            className={`mt-2 text-2xl font-semibold tracking-tight ${accent ? 'text-brand-700' : 'text-ink-950'}`}
          >
            {value}
          </p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          {createElement(Icon, {
            'aria-hidden': true,
            className: 'size-[18px]',
          })}
        </span>
      </div>
      {detail && <p className="mt-3 text-xs text-slate-400">{detail}</p>}
    </article>
  )
}

function StatusBadge({ status }) {
  const style = {
    PLACED: 'bg-amber-50 text-amber-700',
    ACCEPTED: 'bg-blue-50 text-blue-700',
    PREPARING: 'bg-violet-50 text-violet-700',
    READY: 'bg-emerald-50 text-emerald-700',
    SERVED: 'bg-slate-100 text-slate-600',
    REJECTED: 'bg-rose-50 text-rose-700',
    CANCELLED: 'bg-slate-100 text-slate-600',
  }[status] ?? 'bg-slate-100 text-slate-600'

  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}>
      {status?.toLowerCase().replaceAll('_', ' ') ?? 'Unknown'}
    </span>
  )
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {Array.from({ length: 10 }, (_, index) => (
          <LoadingSkeleton key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <LoadingSkeleton className="h-72" />
        <LoadingSkeleton className="h-72" />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const { overview, status, error } = useAppSelector(selectDashboard)

  useEffect(() => {
    dispatch(fetchDashboardOverview())
  }, [dispatch])

  if (status === 'loading' && !overview) return <DashboardLoading />

  if (status === 'failed' && !overview) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <p className="text-sm font-semibold text-rose-800">
          Dashboard data could not be loaded
        </p>
        <p className="mt-1 text-sm text-rose-700">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => dispatch(fetchDashboardOverview())}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </Button>
      </div>
    )
  }

  const stats = overview?.stats
  const orders = overview?.orders ?? []
  const report = overview?.report
  const orderStats = stats?.orders
  const revenueStats = stats?.revenue
  const metrics = [
    { title: 'Total orders', value: orderStats?.total, icon: ClipboardList },
    { title: "Today's orders", value: orderStats?.today, icon: ClipboardList },
    { title: 'Pending orders', value: orderStats?.pending, icon: ArrowDownRight },
    { title: 'Preparing', value: orderStats?.preparing, icon: RefreshCw },
    { title: 'Completed', value: orderStats?.completed, icon: ClipboardList },
    {
      title: 'Total revenue',
      value: formatCurrency(revenueStats?.total),
      icon: IndianRupee,
      accent: true,
    },
    {
      title: "Today's revenue",
      value: formatCurrency(revenueStats?.today),
      icon: IndianRupee,
      accent: true,
    },
    { title: 'Products', value: stats?.products?.total, icon: Package },
    { title: 'Active staff', value: stats?.staff?.active, icon: UsersRound },
    { title: 'Tables', value: stats?.tables?.total, icon: Armchair },
  ]
  const recentOrders = orders.slice(0, 6)
  const paymentData = (report?.paymentBreakdown ?? []).map((item) => ({
    name: item._id === 'ONLINE' ? 'Online' : item._id === 'CASH' ? 'Cash' : item._id,
    revenue: item.revenue,
  }))
  const popularProducts = report?.topProducts ?? []

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
            RestoFlow overview
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink-950">
            Good to see you
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Here’s what’s happening across your restaurant.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => dispatch(fetchDashboardOverview())}>
            <RefreshCw aria-hidden="true" className="size-4" />
            Refresh
          </Button>
          <Link
            to="/admin/products"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add product
          </Link>
        </div>
      </section>

      {status === 'failed' && overview && (
        <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Some dashboard information may be out of date: {error}
        </p>
      )}

      <section aria-label="Restaurant statistics" className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <StatCard key={metric.title} {...metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink-950">
                Revenue by payment method
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Paid invoices from the last 30 days
              </p>
            </div>
            <ChartNoAxesCombined aria-hidden="true" className="size-5 text-brand-600" />
          </div>
          {paymentData.length ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#eef1ef" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `₹${value}`}
                    width={56}
                  />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" name="Revenue" fill="#c96b50" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No paid invoices in this period"
              description="Revenue data will appear here after invoices are paid."
            />
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-ink-950">Popular products</h3>
              <p className="mt-1 text-xs text-slate-500">
                Ranked by quantity sold in the last 30 days
              </p>
            </div>
            <Package aria-hidden="true" className="size-5 text-brand-600" />
          </div>
          {popularProducts.length ? (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={popularProducts.slice(0, 6)}
                  layout="vertical"
                  margin={{ top: 4, right: 10, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke="#eef1ef" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="_id"
                    width={120}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="quantitySold" name="Sold" fill="#4b8272" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No product sales yet"
              description="Top-selling products will be shown after paid orders."
            />
          )}
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-sm font-semibold text-ink-950">Recent orders</h3>
              <p className="mt-1 text-xs text-slate-500">Latest activity from your tables</p>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              View orders <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
          {recentOrders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 sm:px-6">Order</th>
                    <th className="px-5 py-3">Table</th>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3 sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="transition-colors hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink-950 sm:px-6">
                        {order.orderNumber}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {order.table?.tableNumber ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-5 py-3.5 sm:px-6">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState title="No orders yet" description="New orders will show up here." />
            </div>
          )}
        </article>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-ink-950">Quick actions</h3>
            <p className="mt-1 text-xs text-slate-500">Manage the essentials</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Manage menu', detail: 'Products and categories', to: '/admin/products', icon: Package },
              { label: 'View tables', detail: 'Capacity and QR codes', to: '/admin/tables', icon: Armchair },
              { label: 'Manage staff', detail: 'Roles and access', to: '/admin/staff', icon: UsersRound },
              { label: 'Open reports', detail: 'Sales and top products', to: '/admin/reports', icon: ChartNoAxesCombined },
            ].map(({ label, detail, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-brand-100 hover:bg-brand-50/50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                  {createElement(Icon, {
                    'aria-hidden': true,
                    className: 'size-4',
                  })}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink-950">{label}</span>
                  <span className="block text-xs text-slate-500">{detail}</span>
                </span>
                <ArrowRight aria-hidden="true" className="size-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}
