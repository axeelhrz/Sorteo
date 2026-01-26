import { storage } from '@/lib/firebase';
import { ref, getDownloadURL, uploadBytes, deleteObject } from 'firebase/storage';

/**
 * Servicio para manejar operaciones de Firebase Storage
 * Usa un proxy backend para evitar problemas de CORS
 */
export const firebaseStorageService = {
  /**
   * Obtiene la URL de descarga de un archivo a través del proxy backend
   * @param filePath - Ruta del archivo en Firebase Storage
   * @returns URL de descarga del archivo a través del proxy
   */
  async getDownloadUrl(filePath: string): Promise<string> {
    try {
      // Usar el proxy backend en lugar de acceder directamente a Firebase Storage
      const proxyUrl = `/api/storage/download?path=${encodeURIComponent(filePath)}`;
      return proxyUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  },

  /**
   * Obtiene una URL pública para un archivo a través del proxy
   * @param filePath - Ruta del archivo en Firebase Storage
   * @returns URL pública del archivo a través del proxy
   */
  getPublicUrl(filePath: string): string {
    // Usar el proxy backend para evitar CORS
    return `/api/storage/download?path=${encodeURIComponent(filePath)}`;
  },

  /**
   * Obtiene la URL directa de Firebase Storage (para casos especiales)
   * @param filePath - Ruta del archivo en Firebase Storage
   * @returns URL directa de Firebase Storage
   */
  getDirectUrl(filePath: string): string {
    const bucket = storage.app.options.storageBucket;
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(filePath)}?alt=media`;
  },

  /**
   * Sube un archivo a Firebase Storage
   * @param filePath - Ruta donde guardar el archivo
   * @param file - Archivo a subir
   * @returns URL de descarga del archivo subido (a través del proxy)
   */
  async uploadFile(filePath: string, file: File): Promise<string> {
    try {
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, file);
      // Retornar URL a través del proxy
      return `/api/storage/download?path=${encodeURIComponent(filePath)}`;
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
   * @returns URL de descarga del archivo subido (a través del proxy)
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
      // Retornar URL a través del proxy
      return `/api/storage/download?path=${encodeURIComponent(filePath)}`;
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
   * Obtiene una URL con parámetros de caché a través del proxy
   * @param filePath - Ruta del archivo
   * @param cacheControl - Parámetro de control de caché (ej: 'max-age=3600')
   * @returns URL con parámetros de caché a través del proxy
   */
  getUrlWithCache(filePath: string, cacheControl: string = 'max-age=3600'): string {
    return `/api/storage/download?path=${encodeURIComponent(filePath)}&cache=${encodeURIComponent(cacheControl)}`;
  },

  /**
   * Valida si un archivo existe en Firebase Storage
   * @param filePath - Ruta del archivo
   * @returns true si el archivo existe, false en caso contrario
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fileRef = ref(storage, filePath);
      await getDownloadURL(fileRef);
      return true;
    } catch (error) {
      return false;
    }
  },
};