import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './invoiceAPI.js'

export const fetchInvoices = createApiThunk(
  'invoices/fetchAll',
  api.fetchInvoices,
  'Unable to load invoices.',
)
export const generateInvoice = createApiThunk(
  'invoices/generate',
  api.generateCustomerInvoice,
  'Unable to generate invoice.',
)
export const fetchCustomerInvoice = createApiThunk(
  'invoices/fetchCustomer',
  api.fetchCustomerInvoice,
  'Unable to load the invoice.',
)

const invoiceSlice = createSlice({
  name: 'invoices',
  initialState: { items: [], current: null, status: 'idle', error: null },
  reducers: {
    clearCurrentInvoice(state) {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.current = action.payload
      })
      .addCase(fetchCustomerInvoice.fulfilled, (state, action) => {
        state.current = action.payload
      })
  },
})

export const { clearCurrentInvoice } = invoiceSlice.actions
export const selectInvoices = (state) => state.invoices
export default invoiceSlice.reducer
