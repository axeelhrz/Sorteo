import { firebaseRaffleService } from './firebase-raffle-service';
import { Raffle } from '@/types/raffle';

export interface RaffleFilters {
  category?: string;
  shopId?: string;
  status?: string;
  minValue?: number;
  maxValue?: number;
  deliveryType?: 'all' | 'delivery' | 'pickup';
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

// Re-exportar el servicio de Firebase como servicio público
export const publicRaffleService = firebaseRaffleService;