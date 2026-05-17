import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Cart, CartItem, Product, ProductVariant } from "@/types";
import { MIN_PRICE_FOR_FREE_DELIVERY } from "@/constants";

const CART_KEY = "tokomort_cart";

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

function computeTotals(items: CartItem[]): Omit<Cart, "items"> {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = items.reduce((sum, i) => {
    const mrp = (i.variant?.mrp ?? i.product.mrp) * i.quantity;
    const paid = i.price * i.quantity;
    return sum + Math.max(0, mrp - paid);
  }, 0);
  const deliveryFee = subtotal >= MIN_PRICE_FOR_FREE_DELIVERY ? 0 : subtotal === 0 ? 0 : 49;
  return { subtotal, discount, deliveryFee, total: subtotal + deliveryFee };
}

// Empty initial state — hydrated client-side to avoid SSR mismatch
const emptyCart: Cart = {
  items: [],
  subtotal: 0,
  discount: 0,
  deliveryFee: 0,
  total: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState: emptyCart,
  reducers: {
    // Called once on client mount to restore cart from localStorage
    hydrateCart: (state) => {
      if (typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem(CART_KEY);
        const items: CartItem[] = stored ? JSON.parse(stored) : [];
        state.items = items;
        Object.assign(state, computeTotals(items));
      } catch {
        // corrupted storage — start fresh
      }
    },

    addToCart: (
      state,
      action: PayloadAction<{ product: Product; variant?: ProductVariant; quantity?: number }>
    ) => {
      const { product, variant, quantity = 1 } = action.payload;
      const key = variant ? `${product.id}-${variant.id}` : product.id;
      const existing = state.items.find((i) =>
        variant ? i.id === key : i.id === product.id
      );
      const price = variant?.price ?? product.price;

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ id: key, product, variant, quantity, price });
      }

      Object.assign(state, computeTotals(state.items));
      saveCart(state.items);
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      Object.assign(state, computeTotals(state.items));
      saveCart(state.items);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      Object.assign(state, computeTotals(state.items));
      saveCart(state.items);
    },

    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.discount = 0;
      state.deliveryFee = 0;
      state.total = 0;
      saveCart([]);
    },

    applyCoupon: (state, action: PayloadAction<Cart["coupon"]>) => {
      state.coupon = action.payload;
    },

    removeCoupon: (state) => {
      state.coupon = undefined;
    },
  },
});

export const {
  hydrateCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
