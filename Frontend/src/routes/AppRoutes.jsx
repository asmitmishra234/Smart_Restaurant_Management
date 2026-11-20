import { createElement, useEffect } from 'react'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import Loader from '../components/common/Loader.jsx'
import AdminLayout from '../components/layout/AdminLayout.jsx'
import CustomerLayout from '../components/layout/CustomerLayout.jsx'
import KitchenLayout from '../components/layout/KitchenLayout.jsx'
import WaiterLayout from '../components/layout/WaiterLayout.jsx'
import { checkAuth, logout } from '../features/auth/authSlice.js'
import ProtectedRoute from './ProtectedRoute.jsx'
import RoleBasedRoute from './RoleBasedRoute.jsx'
import { getRoleHome } from '../utils/roleHome.js'

const Bill = lazy(() => import('../pages/customer/Bill.jsx'))
const Cart = lazy(() => import('../pages/customer/Cart.jsx'))
const Categories = lazy(() => import('../pages/admin/Categories.jsx'))
const Dashboard = lazy(() => import('../pages/admin/Dashboard.jsx'))
const Feedback = lazy(() => import('../pages/admin/Feedback.jsx'))
const KitchenDashboard = lazy(() => import('../pages/kitchen/KitchenDashboard.jsx'))
const Login = lazy(() => import('../pages/auth/Login.jsx'))
const Menu = lazy(() => import('../pages/customer/Menu.jsx'))
const OrderTracking = lazy(() => import('../pages/customer/OrderTracking.jsx'))
const Orders = lazy(() => import('../pages/admin/Orders.jsx'))
const Products = lazy(() => import('../pages/admin/Products.jsx'))
const Reports = lazy(() => import('../pages/admin/Reports.jsx'))
const Staff = lazy(() => import('../pages/admin/Staff.jsx'))
const Tables = lazy(() => import('../pages/admin/Tables.jsx'))
const WaiterDashboard = lazy(() => import('../pages/waiter/WaiterDashboard.jsx'))

function AuthBootstrap() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  return null
}

function RootRedirect() {
  const { authStatus, user } = useAppSelector((state) => state.auth)

  if (authStatus === 'unknown' || authStatus === 'checking') {
    return <Loader label="Loading RestoFlow" fullScreen />
  }

  return (
    <Navigate
      to={authStatus === 'authenticated' ? getRoleHome(user?.role) : '/login'}
      replace
    />
  )
}

function ConnectedLayout({ Layout }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success('You have signed out.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error?.message ?? 'Unable to sign out. Please try again.')
    }
  }

  return createElement(Layout, { user, onLogout: handleLogout })
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="text-center">
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-xl font-semibold text-ink-950">
          This page could not be found
        </h1>
        <a
          href="/"
          className="mt-4 inline-flex text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Return to RestoFlow
        </a>
      </div>
    </main>
  )
}

function RouteTree() {
  return (
    <>
      <AuthBootstrap />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            background: '#202725',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
      <Suspense fallback={<Loader label="Loading RestoFlow" fullScreen />}>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route element={<CustomerLayout />}>
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/bill" element={<Bill />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleBasedRoute roles={['ADMIN']} />}>
              <Route
                path="/admin"
                element={<ConnectedLayout Layout={AdminLayout} />}
              >
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="products" element={<Products />} />
                <Route path="categories" element={<Categories />} />
                <Route path="tables" element={<Tables />} />
                <Route path="staff" element={<Staff />} />
                <Route path="reports" element={<Reports />} />
                <Route path="feedback" element={<Feedback />} />
              </Route>
            </Route>
            <Route element={<RoleBasedRoute roles={['KITCHEN']} />}>
              <Route
                path="/kitchen"
                element={<ConnectedLayout Layout={KitchenLayout} />}
              >
                <Route index element={<KitchenDashboard />} />
              </Route>
            </Route>
            <Route element={<RoleBasedRoute roles={['WAITER']} />}>
              <Route
                path="/waiter"
                element={<ConnectedLayout Layout={WaiterLayout} />}
              >
                <Route index element={<WaiterDashboard />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <RouteTree />
    </BrowserRouter>
  )
}
