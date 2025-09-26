import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistState {
  wishlistCount: number;
}

const initialState: WishlistState = {
  wishlistCount: 0,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistCount: (state, action: PayloadAction<number>) => {
      state.wishlistCount = action.payload;
    },
    incrementWishlistCount: (state) => {
      state.wishlistCount += 1;
    },
    decrementWishlistCount: (state) => {
      if (state.wishlistCount > 0) {
        state.wishlistCount -= 1;
      }
    },
    clearWishlist: (state) => {
      state.wishlistCount = 0;
    },
  },
});

export const { setWishlistCount, incrementWishlistCount, decrementWishlistCount, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;