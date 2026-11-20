import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.js'
import cartReducer from '../features/cart/cartSlice.js'
import categoryReducer from '../features/categories/categorySlice.js'
import dashboardReducer from '../features/dashboard/dashboardSlice.js'
import feedbackReducer from '../features/feedback/feedbackSlice.js'
import invoiceReducer from '../features/invoices/invoiceSlice.js'
import orderReducer from '../features/orders/orderSlice.js'
import paymentReducer from '../features/payments/paymentSlice.js'
import productReducer from '../features/products/productSlice.js'
import staffReducer from '../features/staff/staffSlice.js'
import tableReducer from '../features/tables/tableSlice.js'
import waiterRequestReducer from '../features/waiterRequests/waiterRequestSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    categories: categoryReducer,
    dashboard: dashboardReducer,
    feedback: feedbackReducer,
    invoices: invoiceReducer,
    orders: orderReducer,
    payments: paymentReducer,
    products: productReducer,
    staff: staffReducer,
    tables: tableReducer,
    waiterRequests: waiterRequestReducer,
  },
})
