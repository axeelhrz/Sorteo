'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@/types/auth';

export default function PanelPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (user.role !== UserRole.SHOP) {
      router.push('/');
      return;
    }

    // Redirect to shop profile
    router.push('/panel/tienda');
  }, [isAuthenticated, user, router]);

  return <div>Redirigiendo...</div>;
}