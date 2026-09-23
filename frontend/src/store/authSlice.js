import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { login as loginApi, getProfile, logout as logoutApi } from '../services/auth';

const initialState = {
  token: localStorage.getItem('token') || null,
  currentUser: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try { return await loginApi(credentials); }
  catch (error) { return rejectWithValue(error.message || 'Login failed'); }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try { return await getProfile(); }
  catch (error) { return rejectWithValue(error.message || 'Unable to load profile'); }
});

export const logout = createAsyncThunk('auth/logout', async (payload) => {
  try { await logoutApi(payload); } catch {}
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { clearAuthError(state) { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload?.data;
        if (action.payload?.statusCode === 200 && user?.token) {
          state.token = user.token;
          state.currentUser = user;
          localStorage.setItem('token', user.token);
        } else state.error = action.payload?.message || 'Login failed';
      })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload || 'Login failed'; })
      .addCase(fetchProfile.fulfilled, (state, action) => { state.currentUser = action.payload?.data || action.payload || null; })
      .addCase(fetchProfile.rejected, (state) => { state.token = null; state.currentUser = null; localStorage.removeItem('token'); })
      .addCase(logout.fulfilled, (state) => { state.token = null; state.currentUser = null; state.error = null; localStorage.removeItem('token'); });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
