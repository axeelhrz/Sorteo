import { apiClient } from '@/lib/api-client';
import { Shop, UpdateShopDto } from '@/types/shop';

export const shopService = {
  async getMyShop(): Promise<Shop> {
    const response = await apiClient.get('/shops/my-shop/current');
    return response.data;
  },

  async getShopById(id: string): Promise<Shop> {
    const response = await apiClient.get(`/shops/${id}`);
    return response.data;
  },

  async updateShop(id: string, data: UpdateShopDto): Promise<Shop> {
    const response = await apiClient.put(`/shops/${id}`, data);
    return response.data;
  },

  async getAllShops(): Promise<Shop[]> {
    const response = await apiClient.get('/shops');
    return response.data;
  },

  async getVerifiedShops(): Promise<Shop[]> {
    const response = await apiClient.get('/shops/verified');
    return response.data;
  },

  async getShopStatistics(shopId: string): Promise<any> {
    const response = await apiClient.get(`/shops/${shopId}/statistics`);
    return response.data;
  },
};