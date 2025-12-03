import { apiClient } from '@/lib/api-client';
import { Complaint, ComplaintStatus, ComplaintType, ComplaintStats } from '@/types/complaint';

export const complaintService = {
  /**
   * Crear un nuevo reclamo
   */
  async createComplaint(data: {
    type: ComplaintType;
    description: string;
    raffleId?: string;
    shopId?: string;
    paymentId?: string;
  }): Promise<Complaint> {
    const response = await apiClient.post('/complaints', data);
    return response.data;
  },

  /**
   * Obtener reclamo por ID
   */
  async getComplaintById(id: string): Promise<Complaint> {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
  },

  /**
   * Obtener reclamos del usuario
   */
  async getUserComplaints(options?: {
    status?: ComplaintStatus;
    type?: ComplaintType;
    limit?: number;
    offset?: number;
  }): Promise<{ complaints: Complaint[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await apiClient.get(`/complaints/user/my-complaints?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener reclamos de una tienda
   */
  async getShopComplaints(
    shopId: string,
    options?: {
      status?: ComplaintStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ complaints: Complaint[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await apiClient.get(`/complaints/shop/${shopId}?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener todos los reclamos (admin)
   */
  async getAllComplaints(options?: {
    status?: ComplaintStatus;
    type?: ComplaintType;
    shopId?: string;
    raffleId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ complaints: Complaint[]; total: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.type) params.append('type', options.type);
    if (options?.shopId) params.append('shopId', options.shopId);
    if (options?.raffleId) params.append('raffleId', options.raffleId);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());

    const response = await apiClient.get(`/complaints?${params.toString()}`);
    return response.data;
  },

  /**
   * Actualizar reclamo (admin)
   */
  async updateComplaint(
    id: string,
    data: {
      status?: ComplaintStatus;
      resolution?: string;
      resolutionNotes?: string;
      assignedAdminId?: string;
    },
  ): Promise<Complaint> {
    const response = await apiClient.put(`/complaints/${id}`, data);
    return response.data;
  },

  /**
   * Agregar mensaje al reclamo
   */
  async addMessage(id: string, message: string): Promise<any> {
    const response = await apiClient.post(`/complaints/${id}/messages`, { message });
    return response.data;
  },

  /**
   * Obtener mensajes del reclamo
   */
  async getMessages(id: string): Promise<any[]> {
    const response = await apiClient.get(`/complaints/${id}/messages`);
    return response.data;
  },

  /**
   * Agregar adjunto al reclamo
   */
  async addAttachment(
    id: string,
    data: {
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
      description?: string;
    },
  ): Promise<any> {
    const response = await apiClient.post(`/complaints/${id}/attachments`, data);
    return response.data;
  },

  /**
   * Obtener adjuntos del reclamo
   */
  async getAttachments(id: string): Promise<any[]> {
    const response = await apiClient.get(`/complaints/${id}/attachments`);
    return response.data;
  },

  /**
   * Cancelar reclamo
   */
  async cancelComplaint(id: string): Promise<Complaint> {
    const response = await apiClient.put(`/complaints/${id}/cancel`, {});
    return response.data;
  },

  /**
   * Exportar libro de reclamaciones (CSV)
   */
  async exportComplaints(options?: {
    startDate?: string;
    endDate?: string;
    shopId?: string;
    status?: ComplaintStatus;
  }): Promise<{ data: string; filename: string }> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.shopId) params.append('shopId', options.shopId);
    if (options?.status) params.append('status', options.status);

    const response = await apiClient.get(`/complaints/export/csv?${params.toString()}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de reclamos
   */
  async getComplaintStats(): Promise<ComplaintStats> {
    const response = await apiClient.get('/complaints/stats/overview');
    return response.data;
  },
};