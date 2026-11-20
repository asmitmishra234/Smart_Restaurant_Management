import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './categoryAPI.js'

export const fetchCategories = createApiThunk(
  'categories/fetchAll',
  api.fetchCategories,
  'Unable to load categories.',
)
export const fetchActiveCategories = createApiThunk(
  'categories/fetchActive',
  api.fetchActiveCategories,
  'Unable to load menu categories.',
)
export const addCategory = createApiThunk(
  'categories/create',
  api.createCategory,
  'Unable to create category.',
)
export const saveCategory = createApiThunk(
  'categories/update',
  api.updateCategory,
  'Unable to update category.',
)
export const changeCategoryStatus = createApiThunk(
  'categories/toggleStatus',
  api.toggleCategoryStatus,
  'Unable to change category status.',
)
export const removeCategory = createApiThunk(
  'categories/delete',
  api.deleteCategory,
  'Unable to delete category.',
)

const categorySlice = createSlice({
  name: 'categories',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchActiveCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchActiveCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(fetchActiveCategories.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(saveCategory.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        )
      })
      .addCase(changeCategoryStatus.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        )
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload)
      })
  },
})

export const selectCategories = (state) => state.categories
export default categorySlice.reducer
