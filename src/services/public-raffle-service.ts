import { apiClient } from '@/lib/api-client';
import { Raffle } from '@/types/raffle';

export interface RaffleFilters {
  category?: string;
  shopId?: string;
  status?: string;
  minValue?: number;
  maxValue?: number;
  search?: string;
  sortBy?: 'newest' | 'closest' | 'price-asc' | 'price-desc';
  page?: number;
  limit?: number;
}

export interface PaginatedRaffles {
  data: Raffle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const publicRaffleService = {
  /**
   * Obtiene sorteos activos con filtros y búsqueda
   */
  async getActiveRaffles(filters?: RaffleFilters): Promise<PaginatedRaffles> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.shopId) {
        params.append('shopId', filters.shopId);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.minValue !== undefined) {
        params.append('minValue', filters.minValue.toString());
      }
      if (filters?.maxValue !== undefined) {
        params.append('maxValue', filters.maxValue.toString());
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters?.page) {
        params.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await apiClient.get(`/raffles/public/active?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching active raffles:', error);
      throw error;
    }
  },

  /**
   * Obtiene un sorteo específico por ID (público)
   */
  async getRaffleById(id: string): Promise<Raffle> {
    try {
      const response = await apiClient.get(`/raffles/public/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching raffle:', error);
      throw error;
    }
  },

  /**
   * Obtiene sorteos de una tienda específica (público)
   */
  async getRafflesByShop(shopId: string, filters?: Omit<RaffleFilters, 'shopId'>): Promise<PaginatedRaffles> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.sortBy) {
        params.append('sortBy', filters.sortBy);
      }
      if (filters?.page) {
        params.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }

      const response = await apiClient.get(`/raffles/public/shop/${shopId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching shop raffles:', error);
      throw error;
    }
  },

  /**
   * Obtiene categorías disponibles para filtrar
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get('/raffles/public/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Obtiene tiendas con sorteos activos
   */
  async getShopsWithActiveRaffles(): Promise<any[]> {
    try {
      const response = await apiClient.get('/raffles/public/shops');
      return response.data;
    } catch (error) {
      console.error('Error fetching shops:', error);
      return [];
    }
  },
};