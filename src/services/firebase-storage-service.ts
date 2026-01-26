import { storage } from '@/lib/firebase';
import { ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';

/**
 * Servicio para manejar operaciones de Firebase Storage
 */
export const firebaseStorageService = {
  /**
   * Obtiene la URL de descarga de un archivo en Firebase Storage
   * @param filePath - Ruta del archivo en Firebase Storage
   * @returns URL de descarga del archivo
   */
  async getDownloadUrl(filePath: string): Promise<string> {
    try {
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  },

  /**
   * Obtiene una URL pública para un archivo (sin autenticación)
   * @param filePath - Ruta del archivo en Firebase Storage
   * @returns URL pública del archivo
   */
  getPublicUrl(filePath: string): string {
    const bucket = storage.app.options.storageBucket;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media`;
  },

  /**
   * Sube un archivo a Firebase Storage
   * @param filePath - Ruta donde guardar el archivo
   * @param file - Archivo a subir
   * @returns URL de descarga del archivo subido
   */
  async uploadFile(filePath: string, file: File): Promise<string> {
    try {
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  /**
   * Sube un archivo con metadatos personalizados
   * @param filePath - Ruta donde guardar el archivo
   * @param file - Archivo a subir
   * @param metadata - Metadatos personalizados
   * @returns URL de descarga del archivo subido
   */
  async uploadFileWithMetadata(
    filePath: string,
    file: File,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const fileRef = ref(storage, filePath);
      const uploadMetadata = metadata ? { customMetadata: metadata } : undefined;
      await uploadBytes(fileRef, file, uploadMetadata);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (error) {
      console.error('Error uploading file with metadata:', error);
      throw error;
    }
  },

  /**
   * Elimina un archivo de Firebase Storage
   * @param filePath - Ruta del archivo a eliminar
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },

  /**
   * Obtiene una URL con parámetros de caché
   * @param filePath - Ruta del archivo
   * @param cacheControl - Parámetro de control de caché (ej: 'max-age=3600')
   * @returns URL con parámetros de caché
   */
  getUrlWithCache(filePath: string, cacheControl: string = 'max-age=3600'): string {
    const bucket = storage.app.options.storageBucket;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media&${cacheControl}`;
  },

  /**
   * Valida si un archivo existe en Firebase Storage
   * @param filePath - Ruta del archivo
   * @returns true si el archivo existe, false en caso contrario
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await this.getDownloadUrl(filePath);
      return true;
    } catch (error) {
      return false;
    }
  },
};