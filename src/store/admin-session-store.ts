import { create } from 'zustand';
import { User } from '@/types/auth';
import { UserRole } from '@/types/auth';

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

const ADMIN_USER: User = {
  id: 'admin',
  uid: 'admin',
  name: 'Administrador',
  email: 'tiketea.online@gmail.com',
  role: UserRole.ADMIN,
};

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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Credenciales inválidas');
      }
      set({
        adminUser: { ...ADMIN_USER, email: email.toLowerCase().trim() },
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
            adminUser: { ...ADMIN_USER, email: data.user.email },
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
