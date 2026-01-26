import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadService = {
  /**
   * Subir imagen de producto directamente a Firebase Storage
   */
  async uploadProductImage(file: File): Promise<string> {
    try {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen válida');
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe superar los 5MB');
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const fileName = `products/${timestamp}-${random}-${file.name}`;

      // Subir a Firebase Storage
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      // Obtener URL de descarga
      const fileUrl = await getDownloadURL(storageRef);
      return fileUrl;
    } catch (error: any) {
      console.error('Error uploading product image:', error);
      throw new Error(error.message || 'Error al subir la imagen');
    }
  },

  /**
   * Subir imagen genérica (para evidencias, avatares, etc.)
   */
  async uploadImage(file: File, folder: string = 'general'): Promise<string> {
    try {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen válida');
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe superar los 5MB');
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const fileName = `${folder}/${timestamp}-${random}-${file.name}`;

      // Subir a Firebase Storage
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, file, {
        contentType: file.type,
      });

      // Obtener URL de descarga
      const fileUrl = await getDownloadURL(storageRef);
      return fileUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(error.message || 'Error al subir la imagen');
    }
  },

  /**
   * Eliminar imagen de Firebase Storage
   */
  async deleteImage(fileName: string): Promise<void> {
    try {
      const { deleteObject } = await import('firebase/storage');
      const storageRef = ref(storage, fileName);
      await deleteObject(storageRef);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      throw new Error(error.message || 'Error al eliminar la imagen');
    }
  },
};