import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

const pages = [
  ['/admin/orders', 'Orders', 'Review and manage incoming restaurant orders.'],
  ['/admin/payments', 'Payments', 'Review and confirm pending cash payments.'],
  ['/admin/products', 'Products', 'Keep your menu items accurate and available.'],
  ['/admin/categories', 'Categories', 'Organize the items on your restaurant menu.'],
  ['/admin/tables', 'Tables', 'Manage seating and table availability.'],
  ['/admin/staff', 'Staff', 'Manage access for your restaurant team.'],
  ['/admin/reports', 'Reports', 'Review restaurant performance and sales.'],
  ['/admin/feedback', 'Feedback', 'Read feedback from your customers.'],
]

export default function AdminLayout({ user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const page = useMemo(
    () => pages.find(([path]) => pathname.startsWith(path)),
    [pathname],
  )
  const title = page?.[1] ?? 'Overview'
  const description =
    page?.[2] ?? 'A clear view of today’s restaurant operations.'

  return (
    <div className="min-h-screen bg-canvas text-ink-950 md:flex">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />
      <div className="min-w-0 flex-1">
        <Header
          title={title}
          description={description}
          user={user}
          onLogout={onLogout}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
