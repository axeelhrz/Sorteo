import { apiClient } from '@/lib/api-client';
import { Raffle, CreateRaffleDto, UpdateRaffleDto } from '@/types/raffle';

export const raffleService = {
  async getRafflesByShop(shopId: string): Promise<Raffle[]> {
    const response = await apiClient.get(`/raffles?shopId=${shopId}`);
    return response.data;
  },

  async getRaffleById(id: string): Promise<Raffle> {
    const response = await apiClient.get(`/raffles/${id}`);
    return response.data;
  },

  async createRaffle(data: CreateRaffleDto): Promise<Raffle> {
    const response = await apiClient.post('/raffles', data);
    return response.data;
  },

  async updateRaffle(id: string, data: UpdateRaffleDto): Promise<Raffle> {
    const response = await apiClient.put(`/raffles/${id}`, data);
    return response.data;
  },

  async submitForApproval(id: string): Promise<Raffle> {
    const response = await apiClient.put(`/raffles/${id}/submit-approval`, {});
    return response.data;
  },

  async cancelRaffle(id: string): Promise<Raffle> {
    const response = await apiClient.put(`/raffles/${id}/cancel`, {});
    return response.data;
  },

  async getActiveRaffles(): Promise<Raffle[]> {
    const response = await apiClient.get('/raffles/active');
    return response.data;
  },

  async getAllRaffles(): Promise<Raffle[]> {
    const response = await apiClient.get('/raffles');
    return response.data;
  },
};