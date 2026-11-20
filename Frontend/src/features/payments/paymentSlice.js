import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './paymentAPI.js'

export const requestCashPayment = createApiThunk(
  'payments/requestCash',
  api.createCashPayment,
  'Unable to request cash payment.',
)
export const fetchPendingCashPayments = createApiThunk(
  'payments/fetchPendingCash',
  api.fetchPendingCashPayments,
  'Unable to load pending cash payments.',
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
  initialState: {
    current: null,
    status: 'idle',
    error: null,
    pendingCashPayments: [],
    pendingCashStatus: 'idle',
    pendingCashError: null,
    confirmingPaymentId: null,
  },
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
      .addCase(fetchPendingCashPayments.pending, (state) => {
        state.pendingCashStatus = 'loading'
        state.pendingCashError = null
      })
      .addCase(fetchPendingCashPayments.fulfilled, (state, action) => {
        state.pendingCashStatus = 'succeeded'
        state.pendingCashPayments = action.payload
      })
      .addCase(fetchPendingCashPayments.rejected, (state, action) => {
        state.pendingCashStatus = 'failed'
        state.pendingCashError = action.payload ?? action.error.message
      })
      .addCase(confirmCashPayment.pending, (state, action) => {
        state.confirmingPaymentId = action.meta.arg
        state.pendingCashError = null
      })
      .addCase(confirmCashPayment.fulfilled, (state, action) => {
        state.current = action.payload.payment
        state.pendingCashPayments = state.pendingCashPayments.filter(
          (payment) => payment._id !== action.payload.payment._id,
        )
        state.confirmingPaymentId = null
        state.pendingCashError = null
      })
      .addCase(confirmCashPayment.rejected, (state, action) => {
        state.confirmingPaymentId = null
        state.pendingCashError = action.payload ?? action.error.message
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
