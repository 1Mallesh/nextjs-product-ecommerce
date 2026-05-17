import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  notificationsOpen: boolean;
  loginModalOpen: boolean;
  loginModalRedirect: string | null;
}

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    cartOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
    notificationsOpen: false,
    loginModalOpen: false,
    loginModalRedirect: null,
  } as UiState,
  reducers: {
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    setCartOpen: (state, action: PayloadAction<boolean>) => { state.cartOpen = action.payload; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    setSearchOpen: (state, action: PayloadAction<boolean>) => { state.searchOpen = action.payload; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    toggleNotifications: (state) => { state.notificationsOpen = !state.notificationsOpen; },
    openLoginModal: (state, action: PayloadAction<string | null>) => {
      state.loginModalOpen = true;
      state.loginModalRedirect = action.payload;
    },
    closeLoginModal: (state) => {
      state.loginModalOpen = false;
      state.loginModalRedirect = null;
    },
  },
});

export const {
  toggleCart, setCartOpen,
  toggleSearch, setSearchOpen,
  toggleMobileMenu,
  toggleNotifications,
  openLoginModal, closeLoginModal,
} = uiSlice.actions;
export default uiSlice.reducer;
