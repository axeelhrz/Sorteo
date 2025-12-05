/**
 * Utilidad para convertir un usuario en administrador
 * 
 * USO:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega este código
 * 3. Ejecuta: makeCurrentUserAdmin()
 * 
 * O para convertir otro usuario por email:
 * makeUserAdminByEmail('usuario@ejemplo.com')
 */

import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

/**
 * Convierte el usuario actual en administrador
 */
export async function makeCurrentUserAdmin(): Promise<void> {
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
  } catch (error: any) {
    console.error('Error al convertir en admin:', error);
    alert(`Error: ${error.message}`);
  }
}

/**
 * Convierte un usuario en administrador por su email
 * (Solo funciona si tienes permisos de admin)
 */
export async function makeUserAdminByEmail(email: string): Promise<void> {
  try {
    // Buscar usuario por email en Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error(`No se encontró ningún usuario con el email: ${email}`);
    }

    const userDoc = snapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);

    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: new Date(),
    });

    console.log(`✅ El usuario ${email} ahora es administrador.`);
    alert(`✅ El usuario ${email} ahora es administrador.`);
  } catch (error: any) {
    console.error('Error al convertir en admin:', error);
    alert(`Error: ${error.message}`);
  }
}

// Hacer disponible globalmente para uso en consola
if (typeof window !== 'undefined') {
  (window as any).makeCurrentUserAdmin = makeCurrentUserAdmin;
  (window as any).makeUserAdminByEmail = makeUserAdminByEmail;
}

