import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, UserRole } from '@/types/auth';
import { emailService } from './email-service';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  shopName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Convierte un FirebaseUser a nuestro tipo User
 */
const convertFirebaseUserToUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    // Obtener datos adicionales del usuario desde Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      // Si no existe el documento, crear uno básico
      const basicUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
        email: firebaseUser.email || '',
        role: UserRole.USER,
      };
      return basicUser;
    }

    const userData = userDoc.data();
    return {
      id: firebaseUser.uid,
      name: userData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
      email: firebaseUser.email || '',
      role: (userData.role as UserRole) || UserRole.USER,
    };
  } catch (error) {
    console.error('Error converting Firebase user:', error);
    // Retornar usuario básico si hay error
    return {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
      email: firebaseUser.email || '',
      role: UserRole.USER,
    };
  }
};

export const firebaseAuthService = {
  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Actualizar el perfil con el nombre
      if (data.name) {
        await updateProfile(firebaseUser, { displayName: data.name });
      }

      // Obtener token de ID
      const token = await firebaseUser.getIdToken();

      // Crear documento de usuario en Firestore
      const userData: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Si es una tienda, crear también el documento de la tienda
      if (data.role === UserRole.SHOP && data.shopName) {
        // Crear documento de tienda primero para obtener su ID
        const shopData = {
          userId: firebaseUser.uid,
          name: data.shopName,
          description: '',
          status: 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        // Crear tienda y obtener su ID
        const shopRef = await addDoc(collection(db, 'shops'), shopData);
        userData.shopId = shopRef.id;
        
        // Crear el usuario con referencia a la tienda
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      } else {
        // Solo crear el usuario
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      }

      // Convertir a nuestro tipo User
      const user = await convertFirebaseUserToUser(firebaseUser);

      return {
        user: user!,
        token,
      };
    } catch (error: any) {
      console.error('Error registering user:', error);
      let errorMessage = 'Error al registrar usuario';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'El método de autenticación por email/password no está habilitado. Por favor, contacta al administrador.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Inicia sesión con email y contraseña
   */
  async login(data: LoginData): Promise<{ user: User; token: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Obtener token de ID
      const token = await firebaseUser.getIdToken();

      // Convertir a nuestro tipo User
      const user = await convertFirebaseUserToUser(firebaseUser);

      return {
        user: user!,
        token,
      };
    } catch (error: any) {
      console.error('Error logging in:', error);
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Usuario deshabilitado';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'El método de autenticación por email/password no está habilitado. Por favor, contacta al administrador.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Cierra sesión
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        return null;
      }
      return await convertFirebaseUserToUser(firebaseUser);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Obtiene el token del usuario actual
   */
  async getCurrentUserToken(): Promise<string | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        return null;
      }
      return await firebaseUser.getIdToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Escucha cambios en el estado de autenticación
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await convertFirebaseUserToUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Cambia la contraseña del usuario actual
   */
  async changePassword(newPassword: string): Promise<void> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No hay usuario autenticado');
      }

      await updatePassword(firebaseUser, newPassword);

      // Enviar correo de confirmación
      if (firebaseUser.email) {
        const user = await convertFirebaseUserToUser(firebaseUser);
        await emailService.sendPasswordChangeConfirmation(
          firebaseUser.email,
          user?.name || 'Usuario'
        );
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      let errorMessage = 'Error al cambiar la contraseña';

      if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por seguridad, debes iniciar sesión nuevamente para cambiar tu contraseña';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  /**
   * Envía correo de recuperación de contraseña
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await firebaseSendPasswordResetEmail(auth, email);
      // Enviar correo adicional con información
      await emailService.sendPasswordResetEmail(email);
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      let errorMessage = 'Error al enviar correo de recuperación';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  },

  /**
   * Actualiza el nombre del usuario
   */
  async updateUserName(newName: string): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('No hay usuario autenticado');
      }

      // Actualizar en Firebase Auth
      await updateProfile(firebaseUser, { displayName: newName });

      // Actualizar en Firestore
      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        { name: newName, updatedAt: serverTimestamp() },
        { merge: true }
      );

      // Retornar usuario actualizado
      return await convertFirebaseUserToUser(firebaseUser);
    } catch (error: any) {
      console.error('Error updating user name:', error);
      throw new Error('Error al actualizar el nombre de usuario');
    }
  },
};