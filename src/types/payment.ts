export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  MERCADO_PAGO = 'mercado_pago',
  PAYPAL = 'paypal',
}

export interface Payment {
  id: string;
  userId: string;
  raffleId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  ticketQuantity: number;
  externalTransactionId?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export interface CreatePaymentRequest {
  raffleId: string;
  amount: number;
  ticketQuantity: number;
}

export interface ConfirmPaymentRequest {
  paymentId: string;
  externalTransactionId: string;
  paymentMethod: PaymentMethod;
}

export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  amount: number;
  ticketQuantity: number;
  raffleId: string;
}