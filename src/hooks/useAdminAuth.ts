import { useAdminSessionStore } from '@/store/admin-session-store';

/**
 * Hook para usar el usuario admin en vistas del dashboard de administración.
 * Usa la sesión admin (cookie), no Firebase.
 */
export function useAdminAuth() {
  const { adminUser, logout, isLoading, isChecked, checkSession } = useAdminSessionStore();
  return {
    user: adminUser,
    logout,
    isLoading,
    isChecked,
    checkSession,
    isAuthenticated: !!adminUser,
  };
}
