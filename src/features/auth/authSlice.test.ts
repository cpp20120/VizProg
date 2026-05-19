import { describe, expect, it } from 'vitest';
import { authReducer, logout } from '@features/auth/authSlice';

describe('authSlice', () => {
  it('clears state on logout', () => {
    const state = authReducer(
      { user: { id: 'u', name: 'A', email: 'a@b.c', createdAt: 'now' }, accessToken: 'a', refreshToken: 'r', authStatus: 'authenticated', error: null },
      { type: logout.fulfilled.type },
    );
    expect(state.accessToken).toBeNull();
    expect(state.authStatus).toBe('anonymous');
  });
});
