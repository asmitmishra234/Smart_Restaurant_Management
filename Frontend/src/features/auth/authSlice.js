import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  currentUserRequest,
  loginRequest,
  logoutRequest,
} from './authAPI.js'
import { getApiErrorMessage } from '../../utils/apiError.js'

const initialState = {
  user: null,
  authStatus: 'unknown',
  isLoading: false,
  error: null,
}

function getRejection(error, fallback) {
  return {
    status: error.response?.status,
    message: getApiErrorMessage(error, fallback),
  }
}

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      return await currentUserRequest()
    } catch (error) {
      return rejectWithValue(getRejection(error, 'Unable to verify your session.'))
    }
  },
  {
    condition: (_, { getState }) =>
      ['unknown', 'error'].includes(getState().auth.authStatus),
  },
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginRequest(credentials)
    } catch (error) {
      return rejectWithValue(getRejection(error, 'Unable to sign in.'))
    }
  },
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutRequest()
    } catch (error) {
      return rejectWithValue(getRejection(error, 'Unable to sign out.'))
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.authStatus = 'checking'
        state.error = null
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.authStatus = 'authenticated'
        state.error = null
      })
      .addCase(checkAuth.rejected, (state, action) => {
        if (action.meta.condition) return
        const status = action.payload?.status
        state.user = null
        state.authStatus = status === 401 ? 'anonymous' : 'error'
        state.error = action.payload?.message ?? action.error.message
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload
        state.authStatus = 'authenticated'
        state.isLoading = false
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message ?? action.error.message
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.authStatus = 'anonymous'
        state.isLoading = false
        state.error = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload?.message ?? action.error.message
      })
  },
})

export const { clearAuthError } = authSlice.actions
export const selectAuth = (state) => state.auth
export const selectCurrentUser = (state) => state.auth.user
export default authSlice.reducer
