import { createSlice } from '@reduxjs/toolkit'
import { createApiThunk } from '../createApiThunk.js'
import * as api from './productAPI.js'

export const fetchProducts = createApiThunk(
  'products/fetchAll',
  api.fetchProducts,
  'Unable to load products.',
)
export const fetchAvailableProducts = createApiThunk(
  'products/fetchAvailable',
  api.fetchAvailableProducts,
  'Unable to load the menu.',
)
export const addProduct = createApiThunk(
  'products/create',
  api.createProduct,
  'Unable to create product.',
)
export const saveProduct = createApiThunk(
  'products/update',
  api.updateProduct,
  'Unable to update product.',
)
export const changeProductAvailability = createApiThunk(
  'products/toggleAvailability',
  api.toggleProductAvailability,
  'Unable to change product availability.',
)
export const removeProduct = createApiThunk(
  'products/delete',
  api.deleteProduct,
  'Unable to delete product.',
)

const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAvailableProducts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchAvailableProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(fetchAvailableProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? action.error.message
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(saveProduct.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        )
      })
      .addCase(changeProductAvailability.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item._id === action.payload._id ? action.payload : item,
        )
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload)
      })
  },
})

export const selectProducts = (state) => state.products
export default productSlice.reducer
