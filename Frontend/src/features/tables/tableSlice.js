import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './tableAPI.js'

export const fetchTables = createApiThunk(
  'tables/fetchAll',
  api.fetchTables,
  'Unable to load tables.',
)
export const addTable = createApiThunk(
  'tables/create',
  api.createTable,
  'Unable to create table.',
)
export const saveTable = createApiThunk(
  'tables/update',
  api.updateTable,
  'Unable to update table.',
)
export const changeTableStatus = createApiThunk(
  'tables/toggleStatus',
  api.toggleTableStatus,
  'Unable to change table status.',
)
export const removeTable = createApiThunk(
  'tables/delete',
  api.deleteTable,
  'Unable to delete table.',
)
export const scanTableQR = createApiThunk(
  'tables/scanQR',
  api.scanTableQR,
  'Unable to start a table session.',
)

const tableSlice = createSlice({
  name: 'tables',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    lastCreated: null,
  },
  reducers: {
    clearLastCreated(state) {
      state.lastCreated = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(addTable.fulfilled, (state, action) => {
        const { table, qrCode } = action.payload
        state.items.unshift(table)
        state.lastCreated = { table, qrCode }
      })
      .addCase(saveTable.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        )
      })
      .addCase(changeTableStatus.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        )
      })
      .addCase(removeTable.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload)
      })
  },
})

export const { clearLastCreated } = tableSlice.actions
export const selectTables = (state) => state.tables
export default tableSlice.reducer
