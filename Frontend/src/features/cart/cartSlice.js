import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addToCart(state, action) {
      const product = action.payload
      const existing = state.items.find((item) => item.productId === product.productId)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, 50)
      } else {
        state.items.push({ ...product, quantity: 1, specialInstructions: '' })
      }
    },
    setCartQuantity(state, action) {
      const { productId, quantity } = action.payload
      const item = state.items.find((entry) => entry.productId === productId)
      if (!item) return
      if (quantity <= 0) {
        state.items = state.items.filter((entry) => entry.productId !== productId)
        return
      }
      item.quantity = Math.min(quantity, 50)
    },
    setCartInstructions(state, action) {
      const { productId, specialInstructions } = action.payload
      const item = state.items.find((entry) => entry.productId === productId)
      if (item) item.specialInstructions = specialInstructions.slice(0, 300)
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const {
  addToCart,
  setCartQuantity,
  setCartInstructions,
  clearCart,
} = cartSlice.actions
export const selectCart = (state) => state.cart
export default cartSlice.reducer
