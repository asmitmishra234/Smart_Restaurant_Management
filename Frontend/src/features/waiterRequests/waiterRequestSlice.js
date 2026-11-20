import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './waiterRequestAPI.js'

export const fetchWaiterRequests = createApiThunk(
  'waiterRequests/fetchAll',
  api.fetchWaiterRequests,
  'Unable to load waiter requests.',
)
export const setWaiterRequestStatus = createApiThunk(
  'waiterRequests/updateStatus',
  api.updateWaiterRequest,
  'Unable to update waiter request.',
)
export const sendWaiterRequest = createApiThunk(
  'waiterRequests/create',
  api.createWaiterRequest,
  'Unable to send your request.',
)

const waiterRequestSlice = createSlice({
  name: 'waiterRequests',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    updateRequestFromSocket(state, action) {
      const { requestId, status, completedAt } = action.payload
      state.items = state.items.map((item) =>
        item._id === requestId ? { ...item, status, completedAt } : item,
      )
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWaiterRequests.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchWaiterRequests.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchWaiterRequests.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(setWaiterRequestStatus.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        )
      })
      .addCase(sendWaiterRequest.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
  },
})

export const { updateRequestFromSocket } = waiterRequestSlice.actions
export const selectWaiterRequests = (state) => state.waiterRequests
export default waiterRequestSlice.reducer
