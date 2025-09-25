import { createSlice, createAsyncThunk, PayloadAction, isRejectedWithValue } from "@reduxjs/toolkit";
import api from '@/lib/axios';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

const initialState : AuthState = {
    user: null,
    token: null,
    isLoading: false,
    error: null, 
};

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    role?: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    user: User;
    token: string;
}

export const login = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string}>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post<AuthResponse>('api/auth/login', credentials);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'login failed');
        }
    }
);

export const register = createAsyncThunk<AuthResponse, RegisterCredentials, {rejectValue: string}>(
    'auth/register',
    async (credentials, { rejectWithValue }) => {
        try{
            const response = await api.post<AuthResponse>('api/auth/register', credentials);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;