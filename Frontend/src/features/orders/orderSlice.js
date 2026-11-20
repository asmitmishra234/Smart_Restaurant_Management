import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './orderAPI.js'

export const fetchOrders = createApiThunk(
  'orders/fetchAll',
  api.fetchOrders,
  'Unable to load orders.',
)
export const setOrderStatus = createApiThunk(
  'orders/updateStatus',
  api.updateOrderStatus,
  'Unable to update order status.',
)
export const placeCustomerOrder = createApiThunk(
  'orders/createCustomerOrder',
  api.createCustomerOrder,
  'Unable to place your order.',
)
export const fetchCustomerOrders = createApiThunk(
  'orders/fetchCustomerOrders',
  api.fetchCustomerOrders,
  'Unable to load your orders.',
)

const orderSlice = createSlice({
  name: 'orders',
  initialState: { items: [], status: 'idle', error: null, placing: false },
  reducers: {
    updateOrderFromSocket(state, action) {
      const { orderId, status, estimatedPreparationTime } = action.payload
      state.items = state.items.map((order) =>
        order._id === orderId
          ? { ...order, status, estimatedPreparationTime }
          : order,
      )
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(setOrderStatus.fulfilled, (state, action) => {
        state.items = state.items.map((order) =>
          order._id === action.payload._id ? action.payload : order,
        )
      })
      .addCase(placeCustomerOrder.pending, (state) => {
        state.placing = true
        state.error = null
      })
      .addCase(placeCustomerOrder.fulfilled, (state, action) => {
        state.placing = false
        state.items.unshift(action.payload)
      })
      .addCase(placeCustomerOrder.rejected, (state, action) => {
        state.placing = false
        state.error = action.payload ?? action.error.message
      })
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        state.items = action.payload
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
  },
})

export const { updateOrderFromSocket } = orderSlice.actions
export const selectOrders = (state) => state.orders
export default orderSlice.reducer
