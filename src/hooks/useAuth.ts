import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function useAuth() {
  const [isHydrated, setIsHydrated] = useState(false);
  const auth = useAuthStore();

  useEffect(() => {
    // Cargar token desde localStorage
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    
    if (token) {
      console.log('Setting token in store:', token);
      auth.setToken(token);
    }
    
    setIsHydrated(true);
  }, []);

  return { ...auth, isHydrated };
}