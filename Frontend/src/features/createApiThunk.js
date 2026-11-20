import { createAsyncThunk } from '@reduxjs/toolkit'
import { getApiErrorMessage } from '../utils/apiError.js'

export function createApiThunk(typePrefix, request, fallback) {
  return createAsyncThunk(typePrefix, async (argument, { rejectWithValue }) => {
    try {
      return await request(argument)
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, fallback))
    }
  })
}
