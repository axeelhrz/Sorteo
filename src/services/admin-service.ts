import { firebasePaymentService, Payment } from './firebase-payment-service';
import { firebaseRaffleWriteService } from './firebase-raffle-write-service';
import { ocrService } from './ocr-service';
import { emailService } from './email-service';
import { ticketAssignmentService } from './ticket-assignment-service';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, updateDoc, where, serverTimestamp } from 'firebase/firestore';
import type { ApproveRaffleParams } from '@/types/raffle';

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
   * Get raffle data with shopId (for history filters)
   */
  async getRaffleDataWithShop(raffleId: string): Promise<{ name: string; shopId?: string }> {
    try {
      const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
      if (raffleDoc.exists()) {
        const raffleData = raffleDoc.data();
        let name = 'Sorteo';
        if (raffleData.productId) {
          const productDoc = await getDoc(doc(db, 'products', raffleData.productId));
          if (productDoc.exists()) {
            name = productDoc.data().name || 'Sorteo';
          }
        }
        return { name, shopId: raffleData.shopId };
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
   * Get unified payment history: compras (user ticket purchases) + pagos a organizadores
   * Supports filters: tipo, shopId, userId, oportunidad (text search)
   */
  async getPaymentHistory(filters?: {
    tipo?: 'compra' | 'pago_organizador';
    shopId?: string;
    userId?: string;
    oportunidad?: string;
  }): Promise<{
    items: Array<{
      id: string;
      type: 'compra' | 'pago_organizador';
      date: Date | string;
      amount: number;
      status?: string;
      userName?: string;
      userEmail?: string;
      shopName?: string;
      opportunityName?: string;
      raffleId?: string;
      ticketQuantity?: number;
      paymentEvidenceUrl?: string;
    }>;
    shops: Array<{ id: string; name: string }>;
    users: Array<{ id: string; name: string; email: string }>;
  }> {
    try {
      const [paymentsRaw, { data: finishedRaffles }] = await Promise.all([
        firebasePaymentService.getAllPayments(300),
        this.getFinishedRaffles(300, 0),
      ]);

      const organizerPayments = finishedRaffles.filter((r: any) => r.paymentToOrganizerAt != null);
      const toDate = (v: any) => (v?.toDate ? v.toDate() : v instanceof Date ? v : v ? new Date(v) : undefined);

      const compras = await Promise.all(
        paymentsRaw.map(async (p) => {
          const [userData, raffleData] = await Promise.all([
            this.getUserData(p.userId),
            this.getRaffleDataWithShop(p.raffleId),
          ]);
          const date = toDate(p.completedAt || p.createdAt) || new Date(0);
          return {
            id: p.id,
            type: 'compra' as const,
            date,
            amount: p.amount || 0,
            status: p.status,
            userName: userData.name,
            userEmail: userData.email,
            shopId: raffleData.shopId,
            opportunityName: raffleData.name,
            raffleId: p.raffleId,
            ticketQuantity: p.ticketQuantity,
            userId: p.userId,
          };
        })
      );

      const pagosOrg = organizerPayments.map((r: any) => {
        const date = toDate(r.paymentToOrganizerAt) || new Date(0);
        const amount = (r.soldTickets || 0) * (r.productValue || 0);
        return {
          id: `org-${r.id}`,
          type: 'pago_organizador' as const,
          date,
          amount,
          shopName: r.shop?.name || 'N/A',
          shopId: r.shopId,
          opportunityName: r.product?.name || 'N/A',
          raffleId: r.id,
          paymentEvidenceUrl: r.paymentEvidenceUrl,
        };
      });

      let items = [...compras, ...pagosOrg].sort((a, b) => {
        const da = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
        const db_ = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
        return db_ - da;
      });

      if (filters?.tipo) {
        items = items.filter((i) => i.type === filters.tipo);
      }
      if (filters?.shopId) {
        items = items.filter((i) => (i as any).shopId === filters.shopId);
      }
      if (filters?.userId) {
        items = items.filter((i) => (i as any).userId === filters.userId);
      }
      if (filters?.oportunidad && filters.oportunidad.trim()) {
        const q = filters.oportunidad.trim().toLowerCase();
        items = items.filter(
          (i) => (i.opportunityName || '').toLowerCase().includes(q)
        );
      }

      const shopIds = new Set<string>();
      const userIds = new Set<string>();
      compras.forEach((c) => {
        if ((c as any).shopId) shopIds.add((c as any).shopId);
        if ((c as any).userId) userIds.add((c as any).userId);
      });
      organizerPayments.forEach((r: any) => {
        if (r.shopId) shopIds.add(r.shopId);
      });

      const shopsList: Array<{ id: string; name: string }> = [];
      for (const sid of shopIds) {
        const shopDoc = await getDoc(doc(db, 'shops', sid));
        if (shopDoc.exists()) {
          shopsList.push({ id: shopDoc.id, name: shopDoc.data().name || 'N/A' });
        }
      }
      shopsList.sort((a, b) => a.name.localeCompare(b.name));

      const usersList: Array<{ id: string; name: string; email: string }> = [];
      for (const uid of userIds) {
        const userData = await this.getUserData(uid);
        usersList.push({ id: uid, name: userData.name, email: userData.email });
      }
      usersList.sort((a, b) => a.name.localeCompare(b.name));

      return {
        items: items.map((i: any) => ({
          id: i.id,
          type: i.type,
          date: i.date instanceof Date ? i.date.toISOString() : (typeof i.date === 'string' ? i.date : ''),
          amount: i.amount,
          status: i.status,
          userName: i.userName,
          userEmail: i.userEmail,
          shopName: i.shopName,
          opportunityName: i.opportunityName,
          raffleId: i.raffleId,
          ticketQuantity: i.ticketQuantity,
          paymentEvidenceUrl: i.paymentEvidenceUrl,
        })),
        shops: shopsList,
        users: usersList,
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  },

  /**
   * Get finished raffles (admin only)
   */
  async getFinishedRaffles(
    limit: number,
    offset: number,
    shopId?: string
  ): Promise<{ data: any[]; total: number }> {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');

      let rafflesRef = collection(db, 'raffles');
      let q = query(rafflesRef, where('status', '==', 'finished'));

      const rafflesSnapshot = await getDocs(q);
      let raffles: any[] = rafflesSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const toDate = (v: any) => (v?.toDate ? v.toDate() : v instanceof Date ? v : v ? new Date(v) : undefined);
        return {
          id: docSnap.id,
          ...data,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
          activatedAt: toDate(data.activatedAt),
          raffleExecutedAt: toDate(data.raffleExecutedAt),
          paymentToOrganizerAt: toDate(data.paymentToOrganizerAt),
          winnerInfo: data.winnerInfo,
          paymentEvidenceUrl: data.paymentEvidenceUrl,
        };
      });

      if (shopId) {
        raffles = raffles.filter((r: any) => r.shopId === shopId);
      }

      const total = raffles.length;
      const paginatedRaffles = raffles.slice(offset, offset + limit);

      const enrichedRaffles = await Promise.all(
        paginatedRaffles.map(async (raffle: any) => {
          const sId = raffle.shopId as string;
          const pId = raffle.productId as string;

          const shopDoc = await getDoc(doc(db, 'shops', sId));
          const productDoc = await getDoc(doc(db, 'products', pId));

          return {
            ...raffle,
            shop: shopDoc.exists() ? { id: shopDoc.id, ...shopDoc.data() } : { id: sId, name: 'Unknown' },
            product: productDoc.exists() ? { id: productDoc.id, ...productDoc.data() } : { id: pId, name: 'Unknown' },
            tickets: raffle.tickets || [],
          };
        })
      );

      return { data: enrichedRaffles, total };
    } catch (error) {
      console.error('Error getting finished raffles:', error);
      throw error;
    }
  },

  /**
   * Registra el pago al organizador (admin): sube el archivo de evidencia por API (Firebase Admin Storage) y envía email al organizador.
   * Devuelve la URL de la evidencia.
   */
  async registerPaymentToOrganizer(raffleId: string, evidenceFile: File): Promise<string> {
    try {
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
    } catch (error) {
      console.error('Error registering payment to organizer:', error);
      throw error;
    }
  },

  /**
   * Get pending raffles (admin only): todos los sorteos de todos los organizadores
   * en estado draft o pending_approval para autorizar o rechazar.
   */
  async getPendingRaffles(
    limit: number,
    offset: number,
    shopId?: string
  ): Promise<{ data: any[]; total: number }> {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');

      const rafflesRef = collection(db, 'raffles');
      // Incluir draft y pending_approval: todos los sorteos de todos los organizadores para autorizar
      const q = query(rafflesRef, where('status', 'in', ['draft', 'pending_approval']));

      const rafflesSnapshot = await getDocs(q);
      let raffles: any[] = rafflesSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      // Ordenar por más recientes primero (en memoria para no requerir índice compuesto)
      raffles.sort((a, b) => {
        const ta = a.createdAt?.toDate?.()?.getTime() ?? a.createdAt ?? 0;
        const tb = b.createdAt?.toDate?.()?.getTime() ?? b.createdAt ?? 0;
        return tb - ta;
      });

      // Filter by shop if provided
      if (shopId) {
        raffles = raffles.filter((r: any) => r.shopId === shopId);
      }

      // Apply pagination
      const total = raffles.length;
      const paginatedRaffles = raffles.slice(offset, offset + limit);

      // Enrich with shop and product data
      const enrichedRaffles = await Promise.all(
        paginatedRaffles.map(async (raffle: any) => {
          const shopId = raffle.shopId as string;
          const productId = raffle.productId as string;
          
          const shopDoc = await getDoc(doc(db, 'shops', shopId));
          const productDoc = await getDoc(doc(db, 'products', productId));
          
          return {
            ...raffle,
            shop: shopDoc.exists() ? { id: shopDoc.id, ...shopDoc.data() } : { id: shopId, name: 'Unknown' },
            product: productDoc.exists() ? { id: productDoc.id, ...productDoc.data() } : { id: productId, name: 'Unknown' }
          };
        })
      );

      return { data: enrichedRaffles, total };
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
   * Actualiza costo por ticket, número de tickets y activa la oportunidad
   */
  async approveRaffle(raffleId: string, params: ApproveRaffleParams): Promise<void> {
    try {
      await firebaseRaffleWriteService.approveRaffle(raffleId, {
        costPerTicket: params.costPerTicket,
        totalTickets: params.totalTickets,
      });
    } catch (error) {
      console.error('Error approving raffle:', error);
      throw error;
    }
  },

  /**
   * Reject raffle (admin only)
   */
  async rejectRaffle(raffleId: string, reason: string): Promise<void> {
    try {
      await firebaseRaffleWriteService.rejectRaffle(raffleId, reason);
    } catch (error) {
      console.error('Error rejecting raffle:', error);
      throw error;
    }
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers(
    limit: number,
    offset: number,
    filters?: { role?: string; status?: string }
  ): Promise<{ data: any[]; total: number }> {
    try {
      const { collection, getDocs } = await import('firebase/firestore');

      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      const toDate = (v: any) => (v?.toDate ? v.toDate() : v instanceof Date ? v : v ? new Date(v) : undefined);

      let users: any[] = usersSnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || data.displayName || 'Sin nombre',
          email: data.email || '',
          role: data.role || 'user',
          createdAt: toDate(data.createdAt) || new Date(0),
          updatedAt: toDate(data.updatedAt),
          shopId: data.shopId,
        };
      });

      if (filters?.role) {
        const roleLower = filters.role.toLowerCase();
        users = users.filter((u: any) => (u.role || '').toLowerCase() === roleLower || (roleLower === 'organizer' && (u.role || '').toLowerCase() === 'shop'));
      }

      const total = users.length;
      const paginatedUsers = users.slice(offset, offset + limit);

      return {
        data: paginatedUsers.map((u) => ({ ...u, createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt })),
        total,
      };
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
   * Fetches real data from Firestore
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
      paymentToOrganizers: number;
      platformIncome: number;
    };
  }> {
    try {
      const { collection, getDocs } = await import('firebase/firestore');

      // Get users count
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      // Get shops statistics
      const shopsRef = collection(db, 'shops');
      const shopsSnapshot = await getDocs(shopsRef);
      const totalShops = shopsSnapshot.size;
      let pendingShops = 0;
      let verifiedShops = 0;
      let blockedShops = 0;

      shopsSnapshot.docs.forEach((doc) => {
        const status = doc.data().status;
        if (status === 'pending') pendingShops++;
        else if (status === 'verified' || status === 'active') verifiedShops++;
        else if (status === 'blocked') blockedShops++;
      });

      // Get raffles statistics
      const rafflesRef = collection(db, 'raffles');
      const rafflesSnapshot = await getDocs(rafflesRef);
      let pendingRaffles = 0;
      let activeRaffles = 0;
      let finishedRaffles = 0;
      let cancelledRaffles = 0;
      let rejectedRaffles = 0;

      rafflesSnapshot.docs.forEach((doc) => {
        const status = doc.data().status;
        if (status === 'pending_approval') pendingRaffles++;
        else if (status === 'active' || status === 'sold_out') activeRaffles++;
        else if (status === 'finished') finishedRaffles++;
        else if (status === 'cancelled') cancelledRaffles++;
        else if (status === 'rejected') rejectedRaffles++;
      });

      // Get tickets statistics
      const ticketsRef = collection(db, 'raffle-tickets');
      const ticketsSnapshot = await getDocs(ticketsRef);
      const totalSoldTickets = ticketsSnapshot.size;

      // Get payments statistics
      const paymentsRef = collection(db, 'payments');
      const paymentsSnapshot = await getDocs(paymentsRef);
      let totalPayments = paymentsSnapshot.size;
      let completedPayments = 0;
      let pendingPayments = 0;
      let failedPayments = 0;
      let refundedPayments = 0;
      let totalRevenue = 0;

      paymentsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const status = data.status;
        
        if (status === 'completed' || status === 'approved') {
          completedPayments++;
          totalRevenue += data.amount || 0;
        } else if (status === 'pending' || status === 'pending_validation') {
          pendingPayments++;
        } else if (status === 'failed') {
          failedPayments++;
        } else if (status === 'refunded') {
          refundedPayments++;
        }
      });

      // Calcular pagos a organizadores (sorteos finalizados con pago registrado)
      let paymentToOrganizers = 0;
      rafflesSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'finished' && data.paymentToOrganizerAt) {
          const sold = data.soldTickets || 0;
          const price = data.productValue || 0;
          paymentToOrganizers += sold * price;
        }
      });
      const platformIncome = Math.max(0, totalRevenue - paymentToOrganizers);

      return {
        users: { total: totalUsers },
        shops: { 
          total: totalShops, 
          pending: pendingShops, 
          verified: verifiedShops, 
          blocked: blockedShops 
        },
        raffles: {
          pending: pendingRaffles,
          active: activeRaffles,
          finished: finishedRaffles,
          cancelled: cancelledRaffles,
          rejected: rejectedRaffles,
        },
        tickets: { totalSold: totalSoldTickets },
        payments: {
          total: totalPayments,
          completed: completedPayments,
          pending: pendingPayments,
          failed: failedPayments,
          refunded: refundedPayments,
          totalRevenue,
          paymentToOrganizers,
          platformIncome,
        },
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get active raffles (admin only)
   * Incluye status 'active' y 'sold_out' (aún no ejecutados).
   */
  async getActiveRaffles(
    limit: number,
    offset: number,
    shopId?: string
  ): Promise<{ data: any[]; total: number }> {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');

      const rafflesRef = collection(db, 'raffles');
      // Firestore no permite OR directo; obtenemos 'active' y luego 'sold_out' y unimos
      const [activeSnap, soldOutSnap] = await Promise.all([
        getDocs(query(rafflesRef, where('status', '==', 'active'))),
        getDocs(query(rafflesRef, where('status', '==', 'sold_out'))),
      ]);

      const toDate = (v: any) => (v?.toDate ? v.toDate() : v instanceof Date ? v : v ? new Date(v) : undefined);
      const docToRaffle = (docSnap: any) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
          activatedAt: toDate(data.activatedAt),
        };
      };

      let raffles: any[] = [
        ...activeSnap.docs.map(docToRaffle),
        ...soldOutSnap.docs.map(docToRaffle),
      ];

      if (shopId) {
        raffles = raffles.filter((r: any) => r.shopId === shopId);
      }

      const total = raffles.length;
      const paginatedRaffles = raffles.slice(offset, offset + limit);

      const enrichedRaffles = await Promise.all(
        paginatedRaffles.map(async (raffle: any) => {
          const sId = raffle.shopId as string;
          const pId = raffle.productId as string;
          const shopDoc = await getDoc(doc(db, 'shops', sId));
          const productDoc = await getDoc(doc(db, 'products', pId));
          return {
            ...raffle,
            shop: shopDoc.exists() ? { id: shopDoc.id, ...shopDoc.data() } : { id: sId, name: 'Unknown' },
            product: productDoc.exists() ? { id: productDoc.id, ...productDoc.data() } : { id: pId, name: 'Unknown' },
          };
        })
      );

      return { data: enrichedRaffles, total };
    } catch (error) {
      console.error('Error getting active raffles:', error);
      throw error;
    }
  },

  /**
   * Cancel raffle (admin only).
   * El sorteo deja de mostrarse en Sorteos Activos y en el catálogo público.
   */
  async cancelRaffle(raffleId: string, reason: string): Promise<void> {
    try {
      await firebaseRaffleWriteService.cancelRaffle(raffleId, reason);
    } catch (error) {
      console.error('Error cancelling raffle:', error);
      throw error;
    }
  },

  /**
   * Execute raffle (admin only)
   * Al completarse el mínimo de tickets, elige ganador aleatorio, envía emails al ganador y al organizador
   */
  async executeRaffle(raffleId: string): Promise<void> {
    try {
      const baseUrl = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const url = `${baseUrl}/api/admin/raffles/${raffleId}/execute`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Error al ejecutar la oportunidad');
      }
    } catch (error) {
      console.error('Error executing raffle:', error);
      throw error;
    }
  },

  /**
   * Get all shops/organizers (admin only) from Firestore collection "shops"
   */
  async getAllShops(
    limit: number,
    offset: number,
    filters?: { status?: string }
  ): Promise<{ data: any[]; total: number }> {
    try {
      const shopsRef = collection(db, 'shops');
      let q = query(shopsRef);
      if (filters?.status) {
        q = query(shopsRef, where('status', '==', filters.status));
      }
      const snapshot = await getDocs(q);

      const toDate = (v: any) => (v?.toDate ? v.toDate() : v instanceof Date ? v : v ? new Date(v) : undefined);

      const shopsWithUsers: any[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const userId = data.userId || '';
        let userData = { id: userId, name: 'Sin nombre', email: '' };
        if (userId) {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const u = userDoc.data();
            userData = {
              id: userDoc.id,
              name: u?.name || u?.displayName || 'Sin nombre',
              email: u?.email || '',
            };
          }
        }
        shopsWithUsers.push({
          id: docSnap.id,
          name: data.name || '',
          description: data.description,
          status: data.status || 'pending',
          createdAt: toDate(data.createdAt) || new Date(0),
          user: userData,
        });
      }

      // Ordenar por nombre
      shopsWithUsers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

      const total = shopsWithUsers.length;
      const paginated = shopsWithUsers.slice(offset, offset + limit).map((s) => ({
        ...s,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
      }));

      return { data: paginated, total };
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
   */
  async getShopDetail(shopId: string): Promise<any> {
    try {
      const shopDoc = await getDoc(doc(db, 'shops', shopId));
      if (!shopDoc.exists()) return null;

      const data = shopDoc.data();
      const userId = data?.userId || '';
      let userData = { id: userId, name: 'Sin nombre', email: '' };
      if (userId) {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const u = userDoc.data();
          userData = {
            id: userDoc.id,
            name: u?.name || u?.displayName || 'Sin nombre',
            email: u?.email || '',
          };
        }
      }

      const toDate = (v: any) => (v?.toDate ? v.toDate() : v instanceof Date ? v : v ? new Date(v) : undefined);

      // Estadísticas de sorteos por shopId
      const rafflesRef = collection(db, 'raffles');
      const rafflesSnap = await getDocs(query(rafflesRef, where('shopId', '==', shopId)));
      let totalRaffles = 0;
      let activeRaffles = 0;
      let finishedRaffles = 0;
      let cancelledRaffles = 0;
      rafflesSnap.docs.forEach((d) => {
        const status = (d.data().status || '').toLowerCase();
        totalRaffles += 1;
        if (status === 'active' || status === 'sold_out') activeRaffles += 1;
        else if (status === 'finished') finishedRaffles += 1;
        else if (status === 'cancelled') cancelledRaffles += 1;
      });

      return {
        id: shopDoc.id,
        name: data?.name || '',
        description: data?.description,
        status: data?.status || 'pending',
        createdAt: toDate(data?.createdAt) instanceof Date ? toDate(data?.createdAt)!.toISOString() : undefined,
        user: userData,
        stats: {
          totalRaffles,
          activeRaffles,
          finishedRaffles,
          cancelledRaffles,
        },
      };
    } catch (error) {
      console.error('Error getting shop detail:', error);
      throw error;
    }
  },

  /**
   * Change shop status (admin only)
   */
  async changeShopStatus(shopId: string, newStatus: string, _reason?: string): Promise<void> {
    try {
      const shopRef = doc(db, 'shops', shopId);
      await updateDoc(shopRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error changing shop status:', error);
      throw error;
    }
  },
};