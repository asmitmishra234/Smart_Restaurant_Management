import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './paymentAPI.js'

export const requestCashPayment = createApiThunk(
  'payments/requestCash',
  api.createCashPayment,
  'Unable to request cash payment.',
)
export const confirmCashPayment = createApiThunk(
  'payments/confirmCash',
  api.confirmCashPayment,
  'Unable to confirm cash payment.',
)
export const createOnlinePaymentOrder = createApiThunk(
  'payments/createOnlineOrder',
  api.createOnlinePaymentOrder,
  'Unable to start online payment.',
)
export const verifyOnlinePayment = createApiThunk(
  'payments/verifyOnline',
  api.verifyOnlinePayment,
  'Unable to verify online payment.',
)

const paymentSlice = createSlice({
  name: 'payments',
  initialState: { current: null, status: 'idle', error: null },
  reducers: {
    clearPaymentError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestCashPayment.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(requestCashPayment.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
      })
      .addCase(requestCashPayment.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(confirmCashPayment.fulfilled, (state, action) => {
        state.current = action.payload.payment
      })
      .addCase(createOnlinePaymentOrder.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload
      })
      .addCase(verifyOnlinePayment.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.current = action.payload.payment
      })
      .addMatcher(
        (action) =>
          action.type.startsWith('payments/') &&
          action.type.endsWith('/rejected') &&
          action.type !== requestCashPayment.rejected.type,
        (state, action) => {
          state.status = 'failed'
          state.error = action.payload ?? action.error.message
        },
      )
  },
})

export const { clearPaymentError } = paymentSlice.actions
export const selectPayment = (state) => state.payments
export default paymentSlice.reducer
