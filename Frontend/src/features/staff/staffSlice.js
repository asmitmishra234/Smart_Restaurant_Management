import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './staffAPI.js'

export const fetchStaff = createApiThunk(
  'staff/fetchAll',
  api.fetchStaff,
  'Unable to load staff.',
)
export const addStaffMember = createApiThunk(
  'staff/create',
  api.createStaff,
  'Unable to create staff account.',
)
export const saveStaffMember = createApiThunk(
  'staff/update',
  api.updateStaff,
  'Unable to update staff account.',
)
export const changeStaffStatus = createApiThunk(
  'staff/toggleStatus',
  api.toggleStaffStatus,
  'Unable to change staff status.',
)

const staffSlice = createSlice({
  name: 'staff',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaff.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(addStaffMember.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(saveStaffMember.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        )
      })
      .addCase(changeStaffStatus.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload.id
            ? { ...item, ...action.payload }
            : item,
        )
      })
  },
})

export const selectStaff = (state) => state.staff
export default staffSlice.reducer
