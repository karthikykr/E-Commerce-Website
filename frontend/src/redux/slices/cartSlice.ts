import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartState {
    cartCount: number;
}

const initialState: CartState = {
    cartCount: 0,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCartCount: (state, action: PayloadAction<number>) => {
            state.cartCount = action.payload;
        },
        incrementCartCount: (state) => {
            state.cartCount += 1;
        },
        decrementCartCount: (state) => {
            if(state.cartCount > 0){
                state.cartCount -= 1;
            }
        },
        clearCart: (state) => {
        state.cartCount = 0;
        },
    },
});

export const { setCartCount, incrementCartCount, decrementCartCount, clearCart } = cartSlice.actions;
export default cartSlice.reducer;