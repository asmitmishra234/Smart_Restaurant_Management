import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarDays, RefreshCw, Wallet } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks.js'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { LoadingSkeleton } from '../../components/common/Loader.jsx'
import { fetchSalesReport } from '../../features/dashboard/dashboardSlice.js'
import { formatCurrency } from '../../utils/formatters.js'

function getDefaultDates() {
  const end = new Date()
  const start = new Date(end)
  start.setDate(start.getDate() - 6)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

export default function Reports() {
  const dispatch = useAppDispatch()
  const { report, reportStatus, reportError } = useAppSelector(
    (state) => state.dashboard,
  )
  const [dates, setDates] = useState(getDefaultDates)
  const [requestedDates, setRequestedDates] = useState(getDefaultDates)
  const startDate = requestedDates?.startDate
  const endDate = requestedDates?.endDate

  useEffect(() => {
    if (startDate && endDate) {
      dispatch(fetchSalesReport({ startDate, endDate }))
    }
  }, [dispatch, startDate, endDate])

  const paymentData = useMemo(
    () =>
      (report?.paymentBreakdown ?? []).map((item) => ({
        method:
          item._id === 'ONLINE'
            ? 'Online'
            : item._id === 'CASH'
              ? 'Cash'
              : item._id,
        revenue: item.revenue,
        count: item.count,
      })),
    [report],
  )
  const popularProducts = report?.topProducts ?? []

  const submitRange = (event) => {
    event.preventDefault()
    setRequestedDates(dates)
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={submitRange}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"
      >
        <label className="flex-1 space-y-1.5">
          <span className="text-xs font-medium text-slate-600">From</span>
          <input
            type="date"
            required
            max={dates.endDate}
            value={dates.startDate}
            onChange={(event) =>
              setDates((value) => ({ ...value, startDate: event.target.value }))
            }
            className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        <label className="flex-1 space-y-1.5">
          <span className="text-xs font-medium text-slate-600">To</span>
          <input
            type="date"
            required
            min={dates.startDate}
            value={dates.endDate}
            onChange={(event) =>
              setDates((value) => ({ ...value, endDate: event.target.value }))
            }
            className="min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-ink-950 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          />
        </label>
        <Button type="submit" loading={reportStatus === 'loading'}>
          <CalendarDays aria-hidden="true" className="size-4" />
          Apply range
        </Button>
      </form>

      {reportStatus === 'loading' && !report ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <LoadingSkeleton key={index} className="h-28" />
          ))}
          <LoadingSkeleton className="h-72 sm:col-span-3" />
        </div>
      ) : reportStatus === 'failed' && !report ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p>{reportError}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => dispatch(fetchSalesReport(dates))}
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          {reportStatus === 'failed' && (
            <p role="status" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Showing the previous report. The latest range could not be loaded: {reportError}
            </p>
          )}
          <section className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Revenue',
                value: formatCurrency(report?.sales?.totalRevenue),
                detail: 'Paid invoices in this period',
              },
              {
                title: 'Invoices',
                value: report?.sales?.totalInvoices ?? '—',
                detail: 'Successfully paid',
              },
              {
                title: 'Orders',
                value: report?.sales?.totalOrders ?? '—',
                detail: 'Created during selected dates',
              },
            ].map((metric) => (
              <article
                key={metric.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-500">{metric.title}</p>
                <p className="mt-2 text-2xl font-semibold text-ink-950">{metric.value}</p>
                <p className="mt-2 text-xs text-slate-400">{metric.detail}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <Wallet aria-hidden="true" className="size-4 text-brand-600" />
                <h2 className="text-sm font-semibold text-ink-950">
                  Payment method breakdown
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Revenue returned by the sales report for{' '}
                {requestedDates?.startDate} – {requestedDates?.endDate}
              </p>
              {paymentData.length ? (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#eef1ef" vertical={false} />
                      <XAxis dataKey="method" axisLine={false} tickLine={false} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${value}`}
                        width={58}
                      />
                      <Tooltip
                        formatter={(value, name) =>
                          name === 'Revenue' ? formatCurrency(value) : value
                        }
                      />
                      <Bar dataKey="revenue" name="Revenue" fill="#c96b50" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title="No paid invoices in this date range"
                    description="Payment method totals will appear after invoices are paid."
                  />
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold text-ink-950">Top-selling products</h2>
              <p className="mt-1 text-xs text-slate-500">
                Units and sales from paid invoices
              </p>
              {popularProducts.length ? (
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={popularProducts}
                      layout="vertical"
                      margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
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
                      <Bar dataKey="quantitySold" name="Units sold" fill="#4b8272" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title="No product sales in this date range"
                    description="Top products are calculated from paid invoices."
                  />
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </div>
  )
}
