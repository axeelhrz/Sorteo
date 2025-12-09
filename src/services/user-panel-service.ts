import { apiClient } from '@/lib/api-client';
import { firebaseUserParticipationService } from './firebase-user-participation-service';
import { firebaseAuthService } from './firebase-auth-service';
import {
  UserParticipation,
  UserWonRaffle,
  UserPurchaseHistory,
  UserNotification,
  UserProfile,
  UserPreferences,
  UserSecuritySettings,
  UserPanelDashboard,
  UserComplaintSummary,
} from '@/types/user-panel';

export const userPanelService = {
  /**
   * Obtener dashboard del usuario
   */
  async getDashboard(): Promise<UserPanelDashboard> {
    try {
      const response = await apiClient.get('/user-panel/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las participaciones del usuario (solo sorteos aprobados)
   */
  async getParticipations(): Promise<UserParticipation[]> {
    try {
      // Obtener usuario actual
      const currentUser = await firebaseAuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener participaciones desde Firebase (solo sorteos aprobados)
      const raffles = await firebaseUserParticipationService.getUserParticipations(currentUser.id);

      // Convertir a formato UserParticipation
      const participations: UserParticipation[] = raffles.map((raffle, index) => ({
        id: `${raffle.id}-${index}`,
        raffleId: raffle.id,
        raffleTitle: raffle.product?.name || 'Sorteo sin nombre',
        raffleImage: raffle.product?.mainImage,
        raffleStatus: raffle.status.toLowerCase() as any,
        shopName: raffle.shop?.name || 'Tienda desconocida',
        ticketCount: 0, // Se obtendría de los tickets del usuario
        ticketNumbers: [], // Se obtendría de los tickets del usuario
        ticketsRemaining: raffle.totalTickets - raffle.soldTickets,
        purchaseDate: raffle.createdAt,
        isWinner: false,
        winnerTicketNumber: undefined,
        soldTickets: raffle.soldTickets,
        totalTickets: raffle.totalTickets,
      }));

      return participations;
    } catch (error) {
      console.error('Error fetching participations:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle de una participación
   */
  async getParticipationDetail(raffleId: string): Promise<UserParticipation> {
    try {
      const response = await apiClient.get(`/user-panel/participations/${raffleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching participation detail:', error);
      throw error;
    }
  },

  /**
   * Obtener sorteos ganados por el usuario
   */
  async getWonRaffles(): Promise<UserWonRaffle[]> {
    try {
      const response = await apiClient.get('/user-panel/won-raffles');
      return response.data;
    } catch (error) {
      console.error('Error fetching won raffles:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle de un sorteo ganado
   */
  async getWonRaffleDetail(raffleId: string): Promise<UserWonRaffle> {
    try {
      const response = await apiClient.get(`/user-panel/won-raffles/${raffleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching won raffle detail:', error);
      throw error;
    }
  },

  /**
   * Marcar un sorteo ganado como recibido
   */
  async markWonRaffleAsReceived(raffleId: string): Promise<UserWonRaffle> {
    try {
      const response = await apiClient.put(`/user-panel/won-raffles/${raffleId}/mark-received`, {});
      return response.data;
    } catch (error) {
      console.error('Error marking raffle as received:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de compras del usuario
   */
  async getPurchaseHistory(): Promise<UserPurchaseHistory[]> {
    try {
      const response = await apiClient.get('/user-panel/purchase-history');
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle de una compra
   */
  async getPurchaseDetail(purchaseId: string): Promise<UserPurchaseHistory> {
    try {
      const response = await apiClient.get(`/user-panel/purchase-history/${purchaseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase detail:', error);
      throw error;
    }
  },

  /**
   * Descargar comprobante de compra (PDF)
   */
  async downloadPurchaseReceipt(purchaseId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/user-panel/purchase-history/${purchaseId}/receipt`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading receipt:', error);
      throw error;
    }
  },

  /**
   * Exportar historial de compras como CSV
   */
  async exportPurchaseHistoryCSV(): Promise<Blob> {
    try {
      const response = await apiClient.get('/user-panel/purchase-history/export/csv', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting purchase history:', error);
      throw error;
    }
  },

  /**
   * Obtener notificaciones del usuario
   */
  async getNotifications(limit?: number): Promise<UserNotification[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await apiClient.get(`/user-panel/notifications${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Marcar notificación como leída
   */
  async markNotificationAsRead(notificationId: string): Promise<UserNotification> {
    try {
      const response = await apiClient.put(`/user-panel/notifications/${notificationId}/read`, {});
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await apiClient.put('/user-panel/notifications/mark-all-read', {});
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Obtener perfil del usuario
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get('/user-panel/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await apiClient.put('/user-panel/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/user-panel/security/change-password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Obtener preferencias del usuario
   */
  async getPreferences(): Promise<UserPreferences> {
    try {
      const response = await apiClient.get('/user-panel/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  },

  /**
   * Actualizar preferencias del usuario
   */
  async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await apiClient.put('/user-panel/preferences', data);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },

  /**
   * Obtener configuración de seguridad
   */
  async getSecuritySettings(): Promise<UserSecuritySettings> {
    try {
      const response = await apiClient.get('/user-panel/security');
      return response.data;
    } catch (error) {
      console.error('Error fetching security settings:', error);
      throw error;
    }
  },

  /**
   * Cerrar todas las sesiones activas
   */
  async closeAllSessions(): Promise<void> {
    try {
      await apiClient.post('/user-panel/security/close-all-sessions', {});
    } catch (error) {
      console.error('Error closing all sessions:', error);
      throw error;
    }
  },

  /**
   * Obtener reclamos del usuario
   */
  async getComplaints(): Promise<UserComplaintSummary[]> {
    try {
      const response = await apiClient.get('/user-panel/complaints');
      return response.data;
    } catch (error) {
      console.error('Error fetching complaints:', error);
      throw error;
    }
  },
};