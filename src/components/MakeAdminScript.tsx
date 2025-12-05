'use client';

import { useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function MakeAdminScript() {
  useEffect(() => {
    // Hacer disponible la función globalmente para uso en consola del navegador
    (window as any).makeCurrentUserAdmin = async () => {
      try {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          throw new Error('No hay usuario autenticado. Por favor, inicia sesión primero.');
        }

        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          throw new Error('No se encontró el documento del usuario en Firestore');
        }

        await updateDoc(userRef, {
          role: 'admin',
          updatedAt: new Date(),
        });

        console.log('✅ Tu usuario ahora es administrador. Recarga la página para ver los cambios.');
        alert('✅ Tu usuario ahora es administrador. Recarga la página para ver los cambios.');
        window.location.reload();
      } catch (error: any) {
        console.error('Error al convertir en admin:', error);
        alert(`Error: ${error.message}`);
      }
    };

    console.log('💡 Para convertir tu usuario en admin, ejecuta en la consola: makeCurrentUserAdmin()');
  }, []);

  return null;
}

