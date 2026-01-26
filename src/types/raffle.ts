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
  thumbnail?: string; // Miniatura del sorteo
  winnerTicketId?: string;
  winnerInfo?: WinnerInfo;
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
  thumbnail?: string; // Miniatura del sorteo
  specialConditions?: string;
}

export interface UpdateRaffleDto {
  thumbnail?: string; // Miniatura del sorteo
  specialConditions?: string;
}

export interface RaffleWithRelations extends Raffle {
  shop: Shop;
  product: Product;
}

// Información del ganador
export interface WinnerInfo {
  userId: string;
  userName?: string;
  userEmail?: string;
  ticketId: string;
  ticketNumber: number;
  verificationCode: string;
  notifiedAt?: Date;
  claimedAt?: Date;
  deliveryStatus: 'pending' | 'contacted' | 'in_delivery' | 'delivered' | 'confirmed';
  deliveryEvidence?: DeliveryEvidence;
  deliveryConfirmedAt?: Date;
  deliveryConfirmedBy?: string;
  deliveryDeadline?: Date;
  reminderSent?: boolean;
  reminderSentAt?: Date;
}

// Evidencia de entrega del premio
export interface DeliveryEvidence {
  photoUrl: string;
  uploadedAt: Date;
  uploadedBy: string;
  notes?: string;
  additionalPhotos?: string[];
}

// DTO para validar código de ganador
export interface ValidateWinnerCodeDto {
  raffleId: string;
  verificationCode: string;
}

// DTO para subir evidencia de entrega
export interface UploadDeliveryEvidenceDto {
  raffleId: string;
  photoUrl: string;
  notes?: string;
  additionalPhotos?: string[];
}

// DTO para confirmar recepción del premio
export interface ConfirmDeliveryDto {
  raffleId: string;
  confirmed: boolean;
  feedback?: string;
}