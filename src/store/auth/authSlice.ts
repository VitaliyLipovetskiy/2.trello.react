import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: number | null;
}

const storedUserId = localStorage.getItem('userId');

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  userId: storedUserId ? Number(storedUserId) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      const { token, refreshToken } = action.payload;
      let userId = state.userId; // eslint-disable-line prefer-destructuring
      try {
        const { id } = jwtDecode<{ id?: number | string }>(token);
        if (typeof id === 'number') userId = id;
        else if (typeof id === 'string') {
          const parsed = Number(id);
          if (!Number.isNaN(parsed)) userId = parsed;
        }
      } catch {
        /* залишаємо попередній userId */
      }
      state.token = token;
      state.refreshToken = refreshToken;
      state.userId = userId;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      if (userId !== null) localStorage.setItem('userId', String(userId));
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.userId = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
