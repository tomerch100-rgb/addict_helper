import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch }) => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            dispatch(logout());
        }
    }
);

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Not authenticated");
        }
    }
);

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true
}

const authSlice = createSlice(
    {
        name: "auth",
        initialState,
        reducers: {
            loginSuccess: (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload;
                state.loading = false;
            },
            logout: (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.loading = false;
            }
        },
        extraReducers: (builder) => {
            builder
                .addCase(checkAuth.pending, (state) => {
                    state.loading = true;
                })
                .addCase(checkAuth.fulfilled, (state, action) => {
                    state.isAuthenticated = true;
                    state.user = action.payload;
                    state.loading = false;
                })
                .addCase(checkAuth.rejected, (state) => {
                    state.isAuthenticated = false;
                    state.user = null;
                    state.loading = false;
                });
        }
    }
)

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer