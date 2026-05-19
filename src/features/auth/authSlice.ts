import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authService } from '@features/auth/authService';
import { toApiError } from '@shared/api/errors';
import type { AuthState, User } from '@shared/types/domain';
import type { RootState } from '@app/store';

type LoginInput = { email: string; password: string };
type RegisterInput = { name: string; email: string; password: string };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: authService.getRefreshToken(),
  authStatus: authService.getRefreshToken() ? 'idle' : 'anonymous',
  error: null,
};

export const login = createAsyncThunk('auth/login', async (input: LoginInput, { rejectWithValue }) => {
  try {
    const response = await authService.login(input.email, input.password);
    authService.setRefreshToken(response.refreshToken);
    return response;
  } catch (error) {
    return rejectWithValue(toApiError(error).message);
  }
});

export const register = createAsyncThunk('auth/register', async (input: RegisterInput, { rejectWithValue }) => {
  try {
    const response = await authService.register(input.name, input.email, input.password);
    authService.setRefreshToken(response.refreshToken);
    return response;
  } catch (error) {
    return rejectWithValue(toApiError(error).message);
  }
});

export const refreshSession = createAsyncThunk('auth/refresh', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const refreshToken = state.auth.refreshToken ?? authService.getRefreshToken();
    const response = await authService.refresh(refreshToken);
    return { ...response, refreshToken };
  } catch (error) {
    authService.clearRefreshToken();
    return rejectWithValue(toApiError(error).message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const state = getState() as RootState;
  await authService.logout(state.auth.refreshToken);
  authService.clearRefreshToken();
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (name: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      return await authService.updateProfile(state.auth.accessToken, name);
    } catch (error) {
      return rejectWithValue(toApiError(error).message);
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (password: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      await authService.changePassword(state.auth.accessToken, password);
    } catch (error) {
      return rejectWithValue(toApiError(error).message);
    }
  },
);

const applyAuth = (state: AuthState, payload: { user: User; accessToken: string; refreshToken: string | null }) => {
  state.user = payload.user;
  state.accessToken = payload.accessToken;
  state.refreshToken = payload.refreshToken;
  state.authStatus = 'authenticated';
  state.error = null;
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.authStatus = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => applyAuth(state, action.payload))
      .addCase(login.rejected, (state, action) => {
        state.authStatus = 'error';
        state.error = typeof action.payload === 'string' ? action.payload : 'Ошибка входа';
      })
      .addCase(register.pending, (state) => {
        state.authStatus = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => applyAuth(state, action.payload))
      .addCase(register.rejected, (state, action) => {
        state.authStatus = 'error';
        state.error = typeof action.payload === 'string' ? action.payload : 'Ошибка регистрации';
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        if (action.payload.refreshToken) applyAuth(state, action.payload);
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.authStatus = 'anonymous';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.authStatus = 'anonymous';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
