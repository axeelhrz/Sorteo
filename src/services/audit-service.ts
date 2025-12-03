import { apiClient } from '@/lib/api-client';

export interface AuditLog {
  id: string;
  adminId: string;
  admin: {
    id: string;
    email: string;
    name: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  details?: string;
  createdAt: string;
}

export const auditService = {
  /**
   * Obtener todos los logs de auditoría
   */
  async getAllLogs(options?: {
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.action) params.append('action', options.action);
    if (options?.entityType) params.append('entityType', options.entityType);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await apiClient.get(`/audit?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener logs de una entidad específica
   */
  async getEntityLogs(entityType: string, entityId: string): Promise<AuditLog[]> {
    const response = await apiClient.get(`/audit/entity/${entityType}/${entityId}`);
    return response.data;
  },

  /**
   * Exportar logs de auditoría (CSV)
   */
  async exportAuditLogs(options?: {
    action?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: string; filename: string }> {
    const params = new URLSearchParams();
    if (options?.action) params.append('action', options.action);
    if (options?.entityType) params.append('entityType', options.entityType);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const response = await apiClient.get(`/audit/export/csv?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de auditoría
   */
  async getAuditStats(): Promise<{
    totalLogs: number;
    actionCounts: Record<string, number>;
    entityTypeCounts: Record<string, number>;
    lastLog: AuditLog;
  }> {
    const response = await apiClient.get('/audit/stats/overview');
    return response.data;
  },
};