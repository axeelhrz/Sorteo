import { apiClient } from '@/lib/api-client';
import { firebaseShopService } from './firebase-shop-service';
import { Shop, UpdateShopDto } from '@/types/shop';

export const shopService = {
  // Operaciones de lectura del marketplace usan Firebase
  async getShopById(id: string): Promise<Shop> {
    return firebaseShopService.getShopById(id);
  },

  async getAllShops(): Promise<Shop[]> {
    return firebaseShopService.getAllShops();
  },

  async getVerifiedShops(): Promise<Shop[]> {
    return firebaseShopService.getVerifiedShops();
  },

  // Operaciones que requieren autenticación siguen usando la API
  async getMyShop(): Promise<Shop> {
    const response = await apiClient.get('/shops/my-shop/current');
    return response.data;
  },

  async updateShop(id: string, data: UpdateShopDto): Promise<Shop> {
    const response = await apiClient.put(`/shops/${id}`, data);
    return response.data;
  },

  async getShopStatistics(shopId: string): Promise<any> {
    const response = await apiClient.get(`/shops/${shopId}/statistics`);
    return response.data;
  },
};