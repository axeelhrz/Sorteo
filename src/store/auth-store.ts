import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/auth';
import { firebaseAuthService } from '@/services/firebase-auth-service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token });
      },
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: async () => {
        try {
          await firebaseAuthService.logout();
        } catch (error) {
          console.error('Error logging out:', error);
        } finally {
          localStorage.removeItem('token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
      refreshToken: async () => {
        try {
          const token = await firebaseAuthService.getCurrentUserToken();
          if (token) {
            get().setToken(token);
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);