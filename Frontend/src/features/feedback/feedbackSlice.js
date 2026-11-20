import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './feedbackAPI.js'

export const fetchFeedback = createApiThunk(
  'feedback/fetchAll',
  api.fetchFeedback,
  'Unable to load feedback.',
)
export const submitFeedback = createApiThunk(
  'feedback/create',
  api.createFeedback,
  'Unable to submit feedback.',
)
export const removeFeedback = createApiThunk(
  'feedback/delete',
  api.deleteFeedback,
  'Unable to delete feedback.',
)

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedback.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(removeFeedback.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload)
      })
  },
})

export const selectFeedback = (state) => state.feedback
export default feedbackSlice.reducer
