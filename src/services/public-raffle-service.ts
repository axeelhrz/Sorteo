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

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

/**
 * Convierte fechas ISO string a Date en la respuesta
 */
const parseRaffleDates = (raffle: any): Raffle => {
  const parse = (v: any) => (v ? new Date(v) : undefined);
  return {
    ...raffle,
    createdAt: parse(raffle.createdAt) || new Date(),
    updatedAt: parse(raffle.updatedAt) || new Date(),
    activatedAt: parse(raffle.activatedAt),
    raffleExecutedAt: parse(raffle.raffleExecutedAt),
    shop: raffle.shop
      ? {
          ...raffle.shop,
          createdAt: parse(raffle.shop.createdAt) || new Date(),
          updatedAt: parse(raffle.shop.updatedAt) || new Date(),
        }
      : undefined,
    product: raffle.product
      ? {
          ...raffle.product,
          createdAt: parse(raffle.product.createdAt) || new Date(),
          updatedAt: parse(raffle.product.updatedAt) || new Date(),
        }
      : undefined,
    winnerInfo: raffle.winnerInfo
      ? {
          ...raffle.winnerInfo,
          notifiedAt: parse(raffle.winnerInfo.notifiedAt),
          claimedAt: parse(raffle.winnerInfo.claimedAt),
          deliveryConfirmedAt: parse(raffle.winnerInfo.deliveryConfirmedAt),
          deliveryDeadline: parse(raffle.winnerInfo.deliveryDeadline),
          deliveryEvidence: raffle.winnerInfo.deliveryEvidence
            ? {
                ...raffle.winnerInfo.deliveryEvidence,
                uploadedAt: parse(raffle.winnerInfo.deliveryEvidence.uploadedAt) || new Date(),
              }
            : undefined,
        }
      : undefined,
  };
};

export const publicRaffleService = {
  async getActiveRaffles(filters?: RaffleFilters): Promise<PaginatedRaffles> {
    const base = getBaseUrl();
    const params = new URLSearchParams();
    if (filters?.shopId) params.set('shopId', filters.shopId);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.minValue != null) params.set('minValue', String(filters.minValue));
    if (filters?.maxValue != null) params.set('maxValue', String(filters.maxValue));
    if (filters?.deliveryType) params.set('deliveryType', filters.deliveryType);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.sortBy) params.set('sortBy', filters.sortBy);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const res = await fetch(`${base}/api/raffles/active?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al cargar las oportunidades');
    }
    const json = await res.json();
    return {
      ...json,
      data: (json.data || []).map(parseRaffleDates),
    };
  },

  async getRaffleById(id: string): Promise<Raffle> {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/raffles/${id}`);
    if (!res.ok) {
      if (res.status === 404) throw new Error('Oportunidad no encontrada');
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al cargar la oportunidad');
    }
    const json = await res.json();
    return parseRaffleDates(json);
  },

  async getCategories(): Promise<string[]> {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/raffles/categories`);
    if (!res.ok) return [];
    return res.json();
  },

  async getShopsWithActiveRaffles(): Promise<Array<{ id: string; name: string }>> {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/raffles/shops`);
    if (!res.ok) return [];
    return res.json();
  },

  async getTicketPrices(): Promise<number[]> {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/raffles/ticket-prices`);
    if (!res.ok) return [];
    return res.json();
  },
};
