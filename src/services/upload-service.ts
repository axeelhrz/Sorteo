import { apiClient } from '@/lib/api-client';

export const uploadService = {
  /**
   * Subir imagen de producto
   */
  async uploadProductImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/uploads/products/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.fileUrl;
  },

  /**
   * Subir imagen genérica (para evidencias, avatares, etc.)
   */
  async uploadImage(file: File, folder: string = 'general'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await apiClient.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.fileUrl;
  },

  /**
   * Eliminar imagen
   */
  async deleteImage(fileName: string): Promise<void> {
    await apiClient.delete(`/uploads/products/image/${fileName}`);
  },
};