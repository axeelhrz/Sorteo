 import { apiClient } from '@/lib/api-client';
import { CreatePaymentRequest, ConfirmPaymentRequest, Payment } from '@/types/payment';

export const paymentService = {
  /**
   * PASO 5: Crear un pago pendiente
   * Se ejecuta cuando el usuario hace clic en "Continuar con la compra"
   */
  async createPayment(data: CreatePaymentRequest): Promise<Payment> {
    try {
      const response = await apiClient.post('/payments', data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  /**
   * PASO 8A.2: Confirmar pago completado
   * Se ejecuta cuando la pasarela retorna con éxito
   */
  async confirmPayment(data: ConfirmPaymentRequest): Promise<Payment> {
    try {
      const response = await apiClient.post('/payments/confirm', data);
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  /**
   * Confirmar pago con voucher (billeteras digitales)
   * Sube el comprobante y envía para validación OCR
   */
  async confirmPaymentWithVoucher(formData: FormData): Promise<Payment> {
    try {
      const response = await apiClient.post('/payments/confirm-with-voucher', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error confirming payment with voucher:', error);
      throw error;
    }
  },

  /**
   * Obtener pagos pendientes de validación (Admin)
   */
  async getPendingPayments(): Promise<Payment[]> {
    try {
      const response = await apiClient.get('/payments/pending-validation');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      throw error;
    }
  },

  /**
   * Validar y aprobar pago (Admin)
   */
  async validatePayment(paymentId: string, approved: boolean, notes?: string): Promise<Payment> {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/validate`, {
        approved,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error validating payment:', error);
      throw error;
    }
  },

  /**
   * PASO 8B.2: Registrar fallo de pago
   * Se ejecuta cuando la pasarela rechaza el pago
   */
  async failPayment(paymentId: string, failureReason: string): Promise<Payment> {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/fail`, {
        failureReason,
      });
      return response.data;
    } catch (error) {
      console.error('Error failing payment:', error);
      throw error;
    }
  },

  /**
   * Obtener un pago por ID
   */
  async getPaymentById(id: string): Promise<Payment> {
    try {
      const response = await apiClient.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  /**
   * Obtener pagos del usuario actual
   */
  async getMyPayments(): Promise<Payment[]> {
    try {
      const response = await apiClient.get('/payments/user/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching user payments:', error);
      throw error;
    }
  },

  /**
   * Obtener pagos completados de un sorteo
   */
  async getCompletedPaymentsByRaffleId(raffleId: string): Promise<Payment[]> {
    try {
      const response = await apiClient.get(`/payments/raffle/${raffleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching raffle payments:', error);
      throw error;
    }
  },

  /**
   * Reembolsar un pago
   */
  async refundPayment(paymentId: string): Promise<Payment> {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/refund`, {});
      return response.data;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  },
};