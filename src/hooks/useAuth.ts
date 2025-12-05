import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { firebaseAuthService } from '@/services/firebase-auth-service';

export function useAuth() {
  const [isHydrated, setIsHydrated] = useState(false);
  const auth = useAuthStore();

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = firebaseAuthService.onAuthStateChanged(async (user) => {
      if (user) {
        // Usuario autenticado
        auth.setUser(user);
        
        // Obtener y actualizar token
        try {
          const token = await firebaseAuthService.getCurrentUserToken();
          if (token) {
            auth.setToken(token);
          }
        } catch (error) {
          console.error('Error getting token:', error);
        }
      } else {
        // Usuario no autenticado
        auth.setUser(null);
        auth.setToken(null);
      }
      
      setIsHydrated(true);
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  return { ...auth, isHydrated };
}