import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/types";

const WISHLIST_KEY = "tokomort_wishlist";

function save(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

interface WishlistState {
  productIds: string[];
  products: Product[];
}

// Empty initial state — hydrated client-side to avoid SSR mismatch
const initialState: WishlistState = { productIds: [], products: [] };

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Called once on client mount to restore wishlist from localStorage
    hydrateWishlist: (state) => {
      if (typeof window === "undefined") return;
      try {
        const stored = localStorage.getItem(WISHLIST_KEY);
        state.productIds = stored ? JSON.parse(stored) : [];
      } catch {
        // corrupted storage — start fresh
      }
    },

    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const idx = state.productIds.indexOf(action.payload.id);
      if (idx === -1) {
        state.productIds.push(action.payload.id);
        state.products.push(action.payload);
      } else {
        state.productIds.splice(idx, 1);
        state.products = state.products.filter((p) => p.id !== action.payload.id);
      }
      save(state.productIds);
    },

    setWishlistProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.productIds = action.payload.map((p) => p.id);
      save(state.productIds);
    },

    clearWishlist: (state) => {
      state.productIds = [];
      state.products = [];
      save([]);
    },
  },
});

export const { hydrateWishlist, toggleWishlist, setWishlistProducts, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
