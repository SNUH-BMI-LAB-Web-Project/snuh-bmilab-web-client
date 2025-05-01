import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LoginResponse } from '@/generated-api/models/LoginResponse';
import { UserSummary } from '@/generated-api/models/UserSummary';

interface AuthState {
  accessToken: string | null;
  user: UserSummary | null;
  role: 'USER' | 'ADMIN' | null;
  login: (response: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      role: null,
      login: (response) =>
        set({
          accessToken: response.accessToken ?? null,
          user: response.user ?? null,
          role: response.role ?? null,
        }),
      logout: () =>
        set({
          accessToken: null,
          user: null,
          role: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        role: state.role,
      }),
    },
  ),
);
