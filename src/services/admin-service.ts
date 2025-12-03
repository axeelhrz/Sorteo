import { apiClient } from '@/lib/api-client';

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  // Raffles
  getPendingRaffles: async (limit = 50, offset = 0) => {
    const response = await apiClient.get('/admin/raffles/pending', {
      params: { limit, offset },
    });
    return response.data;
  },

  getActiveRaffles: async (limit = 50, offset = 0, shopId?: string) => {
    const response = await apiClient.get('/admin/raffles/active', {
      params: { limit, offset, ...(shopId && { shopId }) },
    });
    return response.data;
  },

  getFinishedRaffles: async (limit = 50, offset = 0, shopId?: string) => {
    const response = await apiClient.get('/admin/raffles/finished', {
      params: { limit, offset, ...(shopId && { shopId }) },
    });
    return response.data;
  },

  getRaffleDetail: async (raffleId: string) => {
    const response = await apiClient.get(`/admin/raffles/${raffleId}`);
    return response.data;
  },

  approveRaffle: async (raffleId: string) => {
    const response = await apiClient.put(`/admin/raffles/${raffleId}/approve`, {});
    return response.data;
  },

  rejectRaffle: async (raffleId: string, reason: string) => {
    const response = await apiClient.put(`/admin/raffles/${raffleId}/reject`, {
      reason,
    });
    return response.data;
  },

  cancelRaffle: async (raffleId: string, reason: string) => {
    const response = await apiClient.put(`/admin/raffles/${raffleId}/cancel`, {
      reason,
    });
    return response.data;
  },

  executeRaffle: async (raffleId: string) => {
    const response = await apiClient.put(`/admin/raffles/${raffleId}/execute`, {});
    return response.data;
  },

  // Shops
  getAllShops: async (limit = 50, offset = 0, status?: string) => {
    const response = await apiClient.get('/admin/shops', {
      params: { limit, offset, ...(status && { status }) },
    });
    return response.data;
  },

  getShopDetail: async (shopId: string) => {
    const response = await apiClient.get(`/admin/shops/${shopId}`);
    return response.data;
  },

  changeShopStatus: async (shopId: string, status: string, reason?: string) => {
    const response = await apiClient.put(`/admin/shops/${shopId}/status`, {
      status,
      ...(reason && { reason }),
    });
    return response.data;
  },

  // Users
  getAllUsers: async (limit = 50, offset = 0, role?: string) => {
    const response = await apiClient.get('/admin/users', {
      params: { limit, offset, ...(role && { role }) },
    });
    return response.data;
  },

  getUserDetail: async (userId: string) => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Audit
  getAuditLogs: async (
    limit = 50,
    offset = 0,
    filters?: {
      action?: string;
      entityType?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => {
    const response = await apiClient.get('/admin/audit/logs', {
      params: {
        limit,
        offset,
        ...filters,
      },
    });
    return response.data;
  },

  getEntityAuditLogs: async (entityType: string, entityId: string) => {
    const response = await apiClient.get(`/admin/audit/entity/${entityType}/${entityId}`);
    return response.data;
  },

  // Payments
  getAllPayments: async (limit = 50, offset = 0, filters?: { status?: string; userId?: string; raffleId?: string }) => {
    const response = await apiClient.get('/admin/payments', {
      params: {
        limit,
        offset,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.raffleId && { raffleId: filters.raffleId }),
      },
    });
    return response.data;
  },

  getPaymentDetail: async (paymentId: string) => {
    const response = await apiClient.get(`/admin/payments/${paymentId}`);
    return response.data;
  },
};