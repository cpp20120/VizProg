import { mockApi } from '@shared/api/mockApi';

const refreshTokenKey = 'spreadsheet_refresh_token';

const storage = (): Storage | null => {
  if (typeof window === 'undefined') return null;
  return typeof window.localStorage.getItem === 'function' ? window.localStorage : null;
};

export const authService = {
  getRefreshToken(): string | null {
    return storage()?.getItem(refreshTokenKey) ?? null;
  },
  setRefreshToken(token: string): void {
    storage()?.setItem(refreshTokenKey, token);
  },
  clearRefreshToken(): void {
    storage()?.removeItem(refreshTokenKey);
  },
  login: (email: string, password: string) => mockApi.login(email, password),
  register: (name: string, email: string, password: string) => mockApi.register(name, email, password),
  refresh: (refreshToken: string | null) => mockApi.refresh(refreshToken),
  logout: (refreshToken: string | null) => mockApi.logout(refreshToken),
  updateProfile: (accessToken: string | null, name: string) => mockApi.updateProfile(accessToken, name),
  changePassword: (accessToken: string | null, password: string) => mockApi.changePassword(accessToken, password),
};
