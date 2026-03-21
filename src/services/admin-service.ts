import type { ApproveRaffleParams } from '@/types/raffle';
import type { Payment } from './firebase-payment-service';
import { emailService } from './email-service';

export interface PaymentWithDetails extends Payment {
  userName?: string;
  userEmail?: string;
  raffleName?: string;
}

export interface AdminDashboardStats {
  users: { total: number };
  shops: { total: number; pending: number; verified: number; blocked: number };
  raffles: {
    pending: number;
    active: number;
    finished: number;
    cancelled: number;
    rejected: number;
  };
  tickets: { totalSold: number };
  payments: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    refunded: number;
    totalRevenue: number;
    paymentToOrganizers: number;
    organizerAccrued: number;
    platformIncome: number;
  };
}

export interface RafflesListResponse<T = unknown> {
  data: T[];
  total: number;
}

export interface PaymentHistoryResponse {
  items: Array<{
    id: string;
    type: 'compra' | 'pago_organizador';
    date: string;
    amount: number;
    status?: string;
    userName?: string;
    userEmail?: string;
    shopName?: string;
    opportunityName?: string;
    raffleId?: string;
    ticketQuantity?: number;
    paymentEvidenceUrl?: string;
    shopId?: string;
    userId?: string;
  }>;
  shops: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string; email: string }>;
}

async function callAdminSecure<T>(action: string, payload?: any): Promise<T> {
  const response = await fetch('/api/admin/secure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ action, payload }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Error en operación de administrador');
  }
  return data.data as T;
}

export const adminService = {
  async getPendingPayments(): Promise<Payment[]> {
    return callAdminSecure('getPendingPayments');
  },

  async getPayments(filters?: { status?: string; raffleId?: string }): Promise<Payment[]> {
    return callAdminSecure('getPayments', filters);
  },

  async getUserData(userId: string): Promise<{ email: string; name: string }> {
    return callAdminSecure('getUserData', { userId });
  },

  async getRaffleData(raffleId: string): Promise<{ name: string; costPerTicket?: number }> {
    return callAdminSecure('getRaffleData', { raffleId });
  },

  async approvePaymentAndAssignTickets(paymentId: string, adminId: string): Promise<void> {
    const result = await callAdminSecure<{
      ticketNumbers: number[];
      emailPayload: {
        email: string;
        name: string;
        raffleName: string;
        ticketQuantity: number;
        amount: number;
        paymentMethod: string;
      };
    }>('approvePaymentAndAssignTickets', { paymentId, adminId });

    console.log(`✅ Tickets assigned: ${result.ticketNumbers.join(', ')}`);
    await emailService.sendPaymentApprovedEmail(result.emailPayload);
  },

  async getDashboardStats(): Promise<AdminDashboardStats> {
    return callAdminSecure<AdminDashboardStats>('getDashboardStats');
  },

  async getPendingRaffles(limit: number, offset: number, shopId?: string): Promise<RafflesListResponse> {
    return callAdminSecure<RafflesListResponse>('getPendingRaffles', { limit, offset, shopId });
  },

  async approveRaffle(raffleId: string, params: ApproveRaffleParams) {
    await callAdminSecure('approveRaffle', {
      raffleId,
      costPerTicket: params.costPerTicket,
      totalTickets: params.totalTickets,
    });
  },

  async rejectRaffle(raffleId: string, reason: string) {
    await callAdminSecure('rejectRaffle', { raffleId, reason });
  },

  async getActiveRaffles(limit: number, offset: number, shopId?: string): Promise<RafflesListResponse> {
    return callAdminSecure<RafflesListResponse>('getActiveRaffles', { limit, offset, shopId });
  },

  async cancelRaffle(raffleId: string, reason: string) {
    await callAdminSecure('cancelRaffle', { raffleId, reason });
  },

  async executeRaffle(raffleId: string) {
    const baseUrl = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/admin/raffles/${raffleId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Error al ejecutar la oportunidad');
    }
  },

  async getFinishedRaffles(limit: number, offset: number, shopId?: string): Promise<RafflesListResponse> {
    return callAdminSecure<RafflesListResponse>('getFinishedRaffles', { limit, offset, shopId });
  },

  async registerPaymentToOrganizer(raffleId: string, evidenceFile: File) {
    const baseUrl = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const formData = new FormData();
    formData.append('evidence', evidenceFile);
    const response = await fetch(`${baseUrl}/api/admin/raffles/${raffleId}/register-payment`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar el pago al organizador');
    }
    return data.paymentEvidenceUrl || '';
  },

  async getPaymentHistory(filters?: {
    tipo?: 'compra' | 'pago_organizador';
    shopId?: string;
    userId?: string;
    oportunidad?: string;
  }): Promise<PaymentHistoryResponse> {
    return callAdminSecure<PaymentHistoryResponse>('getPaymentHistory', { filters });
  },

  async getAllUsers(limit: number, offset: number, filters?: { role?: string; status?: string }) {
    return callAdminSecure('getAllUsers', { limit, offset, filters });
  },

  async getAllShops(limit: number, offset: number, filters?: { status?: string }) {
    return callAdminSecure('getAllShops', { limit, offset, filters });
  },

  async getShopDetail(shopId: string) {
    return callAdminSecure('getShopDetail', { shopId });
  },

  async changeShopStatus(shopId: string, newStatus: string, reason?: string) {
    await callAdminSecure('changeShopStatus', { shopId, newStatus, reason });
  },
};
