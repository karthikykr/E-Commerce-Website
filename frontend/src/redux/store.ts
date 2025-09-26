import { configureStore, createReducer } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';

export const store = configureStore ({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        wishlist: wishlistReducer, 
    },
});

//Define types for the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

