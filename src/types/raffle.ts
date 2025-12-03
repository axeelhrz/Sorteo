import { Product } from './product';
import { Shop } from './shop';

export enum RaffleStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  PAUSED = 'paused',
  SOLD_OUT = 'sold_out',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export interface Raffle {
  id: string;
  shopId: string;
  productId: string;
  productValue: number;
  totalTickets: number;
  soldTickets: number;
  status: RaffleStatus;
  requiresDeposit: boolean;
  winnerTicketId?: string;
  specialConditions?: string;
  createdAt: Date;
  updatedAt: Date;
  activatedAt?: Date;
  raffleExecutedAt?: Date;
  shop?: Shop;
  product?: Product;
}

export interface CreateRaffleDto {
  shopId: string;
  productId: string;
  specialConditions?: string;
}

export interface UpdateRaffleDto {
  specialConditions?: string;
}

export interface RaffleWithRelations extends Raffle {
  shop: Shop;
  product: Product;
}