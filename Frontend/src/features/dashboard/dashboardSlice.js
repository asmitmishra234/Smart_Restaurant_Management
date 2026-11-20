import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../../utils/apiError.js'
import { createApiThunk } from '../createApiThunk.js'
import { getDashboardOverview } from './dashboardAPI.js'
import { fetchSalesReport as requestSalesReport } from './reportAPI.js'

const initialState = {
  overview: null,
  report: null,
  status: 'idle',
  reportStatus: 'idle',
  error: null,
  reportError: null,
}

export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      return await getDashboardOverview()
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, 'Unable to load dashboard data.'),
      )
    }
  },
)
export const fetchSalesReport = createApiThunk(
  'dashboard/fetchSalesReport',
  requestSalesReport,
  'Unable to load sales report.',
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.overview = action.payload
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(fetchSalesReport.pending, (state) => {
        state.reportStatus = 'loading'
        state.reportError = null
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.reportStatus = 'succeeded'
        state.report = action.payload
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.reportStatus = 'failed'
        state.reportError = action.payload ?? action.error.message
      })
  },
})

export const selectDashboard = (state) => state.dashboard
export default dashboardSlice.reducer
