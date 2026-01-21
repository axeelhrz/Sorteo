import { firebasePaymentService, Payment } from './firebase-payment-service';
import { ocrService } from './ocr-service';
import { emailService } from './email-service';
import { ticketAssignmentService } from './ticket-assignment-service';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Admin Service for Payment Management
 * 
 * Handles payment validation, OCR processing, and email notifications
 */

export interface PaymentWithDetails extends Payment {
  userName?: string;
  userEmail?: string;
  raffleName?: string;
}

export const adminService = {
  /**
   * Process payment with OCR validation
   * This is called automatically after a voucher is uploaded
   */
  async processPaymentWithOCR(payment: Payment): Promise<void> {
    try {
      if (!payment.voucherUrl) {
        throw new Error('No voucher URL found');
      }

      console.log('Processing payment with OCR:', payment.id);

      // Run OCR validation
      const validationResult = await ocrService.processAndValidate(
        payment.voucherUrl,
        payment.amount
      );

      // Update payment with OCR results
      await firebasePaymentService.updateOCRValidation(payment.id, {
        extractedAmount: validationResult.extractedAmount,
        confidence: validationResult.confidence,
        isValid: validationResult.isValid,
        message: validationResult.message,
      });

      // Send email based on OCR result
      if (validationResult.isValid) {
        // OCR validation successful - send validation in progress email
        await this.sendValidationInProgressEmail(payment);
      } else {
        // OCR validation failed - send validation failed email
        await this.sendValidationFailedEmail(payment, validationResult.message);
      }
    } catch (error) {
      console.error('Error processing payment with OCR:', error);
      throw error;
    }
  },

  /**
   * Send email when payment is being validated
   */
  async sendValidationInProgressEmail(payment: Payment): Promise<void> {
    try {
      const userData = await this.getUserData(payment.userId);

      await emailService.sendPaymentValidationEmail({
        email: userData.email,
        name: userData.name,
        ticketQuantity: payment.ticketQuantity,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod?.toUpperCase() || 'N/A',
      });
    } catch (error) {
      console.error('Error sending validation in progress email:', error);
    }
  },

  /**
   * Send email when OCR validation fails
   */
  async sendValidationFailedEmail(payment: Payment, reason: string): Promise<void> {
    try {
      const userData = await this.getUserData(payment.userId);

      await emailService.sendPaymentValidationFailedEmail({
        email: userData.email,
        name: userData.name,
        ticketQuantity: payment.ticketQuantity,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod?.toUpperCase() || 'N/A',
        reason,
        paymentId: payment.id,
      });
    } catch (error) {
      console.error('Error sending validation failed email:', error);
    }
  },

  /**
   * Send email when payment is approved by admin
   */
  async sendPaymentApprovedEmail(payment: Payment): Promise<void> {
    try {
      const userData = await this.getUserData(payment.userId);
      const raffleData = await this.getRaffleData(payment.raffleId);

      await emailService.sendPaymentApprovedEmail({
        email: userData.email,
        name: userData.name,
        raffleName: raffleData.name,
        ticketQuantity: payment.ticketQuantity,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod?.toUpperCase() || 'N/A',
      });
    } catch (error) {
      console.error('Error sending payment approved email:', error);
    }
  },

  /**
   * Approve payment and assign tickets
   */
  async approvePaymentAndAssignTickets(
    paymentId: string,
    adminId: string
  ): Promise<void> {
    try {
      // Get payment details
      const payment = await firebasePaymentService.getPaymentById(paymentId);

      // Approve payment
      await firebasePaymentService.approvePayment(paymentId, adminId);

      // Assign tickets to user
      const assignmentResult = await ticketAssignmentService.assignTicketsToUser(
        payment.raffleId,
        payment.userId,
        payment.id,
        payment.ticketQuantity
      );

      if (!assignmentResult.success) {
        throw new Error(assignmentResult.error || 'Error al asignar tickets');
      }

      console.log(`✅ Tickets assigned: ${assignmentResult.ticketNumbers.join(', ')}`);

      // Send confirmation email
      await this.sendPaymentApprovedEmail(payment);
    } catch (error) {
      console.error('Error approving payment and assigning tickets:', error);
      throw error;
    }
  },

  /**
   * Get user data from Firestore
   */
  async getUserData(userId: string): Promise<{ email: string; name: string }> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          email: userData.email || 'user@example.com',
          name: userData.name || userData.displayName || 'Usuario',
        };
      }
      return { email: 'user@example.com', name: 'Usuario' };
    } catch (error) {
      console.error('Error getting user data:', error);
      return { email: 'user@example.com', name: 'Usuario' };
    }
  },

  /**
   * Get raffle data from Firestore
   */
  async getRaffleData(raffleId: string): Promise<{ name: string }> {
    try {
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      if (raffleDoc.exists()) {
        const raffleData = raffleDoc.data();
        
        // Get product name
        if (raffleData.productId) {
          const productDoc = await getDoc(doc(db, 'products', raffleData.productId));
          if (productDoc.exists()) {
            const productData = productDoc.data();
            return { name: productData.name || 'Sorteo' };
          }
        }
        
        return { name: 'Sorteo' };
      }
      return { name: 'Sorteo' };
    } catch (error) {
      console.error('Error getting raffle data:', error);
      return { name: 'Sorteo' };
    }
  },

  /**
   * Get all pending validation payments
   */
  async getPendingPayments(): Promise<Payment[]> {
    try {
      return await firebasePaymentService.getPendingValidationPayments();
    } catch (error) {
      console.error('Error getting pending payments:', error);
      throw error;
    }
  },

  /**
   * Get finished raffles (admin only)
   * TODO: Implement proper Firestore query for finished raffles
   */
  async getFinishedRaffles(
    _limit: number,
    _offset: number,
    _shopId?: string
  ): Promise<{ data: any[]; total: number }> {
    try {
      // This is a placeholder implementation
      // In a real application, you would query Firestore for finished raffles
      // Parameters: limit, offset, shopId will be used for pagination and filtering
      console.warn('getFinishedRaffles is not fully implemented yet');
      return { data: [], total: 0 };
    } catch (error) {
      console.error('Error getting finished raffles:', error);
      throw error;
    }
  },

  /**
   * Get pending raffles (admin only)
   * TODO: Implement proper Firestore query for pending raffles
   */
  async getPendingRaffles(
    _limit: number,
    _offset: number,
    _shopId?: string
  ): Promise<{ data: any[]; total: number }> {
    try {
      // This is a placeholder implementation
      // In a real application, you would query Firestore for pending raffles
      // Parameters: limit, offset, shopId will be used for pagination and filtering
      console.warn('getPendingRaffles is not fully implemented yet');
      return { data: [], total: 0 };
    } catch (error) {
      console.error('Error getting pending raffles:', error);
      throw error;
    }
  },

  /**
   * Get raffle detail (admin only)
   * TODO: Implement proper Firestore query for raffle details
   */
  async getRaffleDetail(_raffleId: string): Promise<any> {
    try {
      // This is a placeholder implementation
      // In a real application, you would query Firestore for raffle details
      console.warn('getRaffleDetail is not fully implemented yet');
      return null;
    } catch (error) {
      console.error('Error getting raffle detail:', error);
      throw error;
    }
  },

  /**
   * Approve raffle (admin only)
   * TODO: Implement proper Firestore update for raffle approval
   */
  async approveRaffle(_raffleId: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would update the raffle status in Firestore
      console.warn('approveRaffle is not fully implemented yet');
    } catch (error) {
      console.error('Error approving raffle:', error);
      throw error;
    }
  },

  /**
   * Reject raffle (admin only)
   * TODO: Implement proper Firestore update for raffle rejection
   */
  async rejectRaffle(_raffleId: string, _reason: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would update the raffle status in Firestore
      console.warn('rejectRaffle is not fully implemented yet');
    } catch (error) {
      console.error('Error rejecting raffle:', error);
      throw error;
    }
  },

  /**
   * Get all users (admin only)
   * TODO: Implement proper Firestore query for users
   */
  async getAllUsers(
    _limit: number,
    _offset: number,
    _filters?: { role?: string; status?: string }
  ): Promise<{ data: any[]; total: number }> {
    try {
      // This is a placeholder implementation
      // In a real application, you would query Firestore for users
      // Parameters: limit, offset, filters will be used for pagination and filtering
      console.warn('getAllUsers is not fully implemented yet');
      return { data: [], total: 0 };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  /**
   * Suspend user (admin only)
   * TODO: Implement proper Firestore update for user suspension
   */
  async suspendUser(_userId: string, _reason: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would update the user status in Firestore
      console.warn('suspendUser is not fully implemented yet');
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  },

  /**
   * Reactivate user (admin only)
   * TODO: Implement proper Firestore update for user reactivation
   */
  async reactivateUser(_userId: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would update the user status in Firestore
      console.warn('reactivateUser is not fully implemented yet');
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  },

  /**
   * Get dashboard statistics (admin only)
   * TODO: Implement proper Firestore queries for dashboard stats
   */
  async getDashboardStats(): Promise<{
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
    };
  }> {
    try {
      // This is a placeholder implementation
      // In a real application, you would query Firestore for actual statistics
      console.warn('getDashboardStats is not fully implemented yet');
      return {
        users: { total: 0 },
        shops: { total: 0, pending: 0, verified: 0, blocked: 0 },
        raffles: {
          pending: 0,
          active: 0,
          finished: 0,
          cancelled: 0,
          rejected: 0,
        },
        tickets: { totalSold: 0 },
        payments: {
          total: 0,
          completed: 0,
          pending: 0,
          failed: 0,
          refunded: 0,
          totalRevenue: 0,
        },
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get active raffles (admin only)
   * TODO: Implement proper Firestore query for active raffles
   */
  async getActiveRaffles(
    _limit: number,
    _offset: number,
    _shopId?: string
  ): Promise<{ data: any[]; total: number }> {
    try {
      // This is a placeholder implementation
      // In a real application, you would query Firestore for active raffles
      // Parameters: limit, offset, shopId will be used for pagination and filtering
      console.warn('getActiveRaffles is not fully implemented yet');
      return { data: [], total: 0 };
    } catch (error) {
      console.error('Error getting active raffles:', error);
      throw error;
    }
  },

  /**
   * Cancel raffle (admin only)
   * TODO: Implement proper Firestore update for raffle cancellation
   */
  async cancelRaffle(_raffleId: string, _reason: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would update the raffle status to cancelled in Firestore
      console.warn('cancelRaffle is not fully implemented yet');
    } catch (error) {
      console.error('Error cancelling raffle:', error);
      throw error;
    }
  },

  /**
   * Execute raffle (admin only)
   * TODO: Implement proper raffle execution logic
   */
  async executeRaffle(_raffleId: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would:
      // 1. Select a random winner from sold tickets
      // 2. Update raffle status to finished
      // 3. Notify the winner
      console.warn('executeRaffle is not fully implemented yet');
    } catch (error) {
      console.error('Error executing raffle:', error);
      throw error;
    }
  },

  /**
   * Get all shops/organizers (admin only)
   * TODO: Implement proper Firestore query for shops
   */
  async getAllShops(
    _limit: number,
    _offset: number,
    _filters?: { status?: string }
  ): Promise<{ data: any[]; total: number }> {
    try {
      // This is a placeholder implementation
      // In a real application, you would query Firestore for shops
      // Parameters: limit, offset, filters will be used for pagination and filtering
      console.warn('getAllShops is not fully implemented yet');
      return { data: [], total: 0 };
    } catch (error) {
      console.error('Error getting all shops:', error);
      throw error;
    }
  },

  /**
   * Verify shop/organizer (admin only)
   * TODO: Implement proper Firestore update for shop verification
   */
  async verifyShop(_shopId: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would update the shop status to verified in Firestore
      console.warn('verifyShop is not fully implemented yet');
    } catch (error) {
      console.error('Error verifying shop:', error);
      throw error;
    }
  },

  /**
   * Block shop/organizer (admin only)
   * TODO: Implement proper Firestore update for shop blocking
   */
  async blockShop(_shopId: string, _reason: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would update the shop status to blocked in Firestore
      console.warn('blockShop is not fully implemented yet');
    } catch (error) {
      console.error('Error blocking shop:', error);
      throw error;
    }
  },

  /**
   * Unblock shop/organizer (admin only)
   * TODO: Implement proper Firestore update for shop unblocking
   */
  async unblockShop(_shopId: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would update the shop status to active in Firestore
      console.warn('unblockShop is not fully implemented yet');
    } catch (error) {
      console.error('Error unblocking shop:', error);
      throw error;
    }
  },

  /**
   * Get shop detail with statistics (admin only)
   * TODO: Implement proper Firestore query for shop details
   */
  async getShopDetail(_shopId: string): Promise<any> {
    try {
      // This is a placeholder implementation
      // In a real application, you would query Firestore for shop details and statistics
      console.warn('getShopDetail is not fully implemented yet');
      return null;
    } catch (error) {
      console.error('Error getting shop detail:', error);
      throw error;
    }
  },

  /**
   * Change shop status (admin only)
   * TODO: Implement proper Firestore update for shop status change
   */
  async changeShopStatus(_shopId: string, _newStatus: string, _reason?: string): Promise<void> {
    try {
      // This is a placeholder implementation
      // In a real application, you would update the shop status in Firestore
      console.warn('changeShopStatus is not fully implemented yet');
    } catch (error) {
      console.error('Error changing shop status:', error);
      throw error;
    }
  },
};