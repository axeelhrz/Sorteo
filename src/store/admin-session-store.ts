import { create } from 'zustand';
import { User, UserRole } from '@/types/auth';

interface AdminSessionState {
  adminUser: User | null;
  isLoading: boolean;
  isChecked: boolean;
  setAdminUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<boolean>;
}

export const useAdminSessionStore = create<AdminSessionState>((set, get) => ({
  adminUser: null,
  isLoading: false,
  isChecked: false,
  setAdminUser: (adminUser) => set({ adminUser }),
  setLoading: (isLoading) => set({ isLoading }),
  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }
      set({
        adminUser: {
          id: data.user.id,
          uid: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: UserRole.ADMIN,
        },
        isLoading: false,
        isChecked: true,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
  logout: async () => {
    try {
      await fetch('/api/admin/session', { method: 'DELETE', credentials: 'include' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    set({ adminUser: null, isChecked: true });
  },
  checkSession: async () => {
    if (get().isChecked && get().adminUser) return true;
    set({ isLoading: true });
    try {
      const res = await fetch('/api/admin/session', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.user) {
          set({
            adminUser: {
              id: data.user.id,
              uid: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: UserRole.ADMIN,
            },
            isLoading: false,
            isChecked: true,
          });
          return true;
        }
      }
      set({ adminUser: null, isLoading: false, isChecked: true });
      return false;
    } catch (e) {
      set({ adminUser: null, isLoading: false, isChecked: true });
      return false;
    }
  },
}));
