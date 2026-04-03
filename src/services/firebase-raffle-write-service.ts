import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Raffle, RaffleStatus, CreateRaffleDto, UpdateRaffleDto, WinnerInfo } from '@/types/raffle';
import { Product } from '@/types/product';

// Helper para convertir Firestore timestamp a Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

// Helper para convertir documento de Firestore a Raffle
const convertRaffleDoc = async (docSnap: QueryDocumentSnapshot<DocumentData>): Promise<Raffle> => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    shopId: data.shopId || '',
    productId: data.productId || '',
    productValue: data.productValue || 0,
    totalTickets: data.totalTickets || 0,
    soldTickets: data.soldTickets || 0,
    status: data.status || RaffleStatus.DRAFT,
    requiresDeposit: data.requiresDeposit || false,
    winnerTicketId: data.winnerTicketId,
    specialConditions: data.specialConditions,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    activatedAt: data.activatedAt ? convertTimestamp(data.activatedAt) : undefined,
    raffleExecutedAt: data.raffleExecutedAt ? convertTimestamp(data.raffleExecutedAt) : undefined,
    paymentToOrganizerAt: data.paymentToOrganizerAt ? convertTimestamp(data.paymentToOrganizerAt) : undefined,
    paymentEvidenceUrl: data.paymentEvidenceUrl,
    organizerPaymentConfirmedAt: data.organizerPaymentConfirmedAt
      ? convertTimestamp(data.organizerPaymentConfirmedAt)
      : undefined,
    organizerPaymentConfirmedBy:
      typeof data.organizerPaymentConfirmedBy === 'string' ? data.organizerPaymentConfirmedBy : undefined,
    winnerInfo: data.winnerInfo,
  };
};

export const firebaseRaffleWriteService = {
  /**
   * Crea un nuevo sorteo.
   * - Valor del producto: solo en product.value (lo ve la administración).
   * - Precio por ticket: raffle.productValue; si se pasa costPerTicket se usa y se calculan los tickets.
   */
  async createRaffle(data: CreateRaffleDto): Promise<Raffle> {
    try {
      const productDoc = await getDoc(doc(db, 'products', data.productId));
      if (!productDoc.exists()) {
        throw new Error('Producto no encontrado');
      }

      const productData = productDoc.data() as Product;
      const productValueReal = productData.value || 0; // valor del producto (solo admin)
      const deliveryCost = productData.deliveryCost ?? 0;
      const costPerTicket = data.costPerTicket ?? 0;

      // Precio por ticket (lo que paga el participante): lo define el organizador o queda para que lo apruebe admin
      const ticketPrice = costPerTicket > 0 ? costPerTicket : productValueReal / 2;
      // Número de tickets: (valor producto + delivery) * ratio / precio por ticket (ratio 2)
      const totalTickets =
        ticketPrice > 0
          ? Math.floor((productValueReal + deliveryCost) * 2 / ticketPrice)
          : Math.floor(productValueReal * 2);

      if (totalTickets <= 0) {
        throw new Error('El precio por ticket debe ser mayor a 0');
      }

      const rafflesRef = collection(db, 'raffles');
      const raffleData = {
        shopId: data.shopId,
        productId: data.productId,
        productValue: ticketPrice, // en el sorteo guardamos el precio por ticket (lo que ve el usuario)
        totalTickets,
        soldTickets: 0,
        status: RaffleStatus.DRAFT,
        requiresDeposit: productData.requiresDeposit || false,
        specialConditions: data.specialConditions || null,
        winnerTicketId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(rafflesRef, raffleData);
      const raffleDoc = await getDoc(docRef);
      
      if (!raffleDoc.exists()) {
        throw new Error('Error al crear el sorteo');
      }

      return await convertRaffleDoc(raffleDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error creating raffle:', error);
      throw error;
    }
  },

  /**
   * Actualiza un sorteo existente
   */
  async updateRaffle(id: string, data: UpdateRaffleDto): Promise<Raffle> {
    try {
      const raffleRef = doc(db, 'raffles', id);
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (data.specialConditions !== undefined) {
        updateData.specialConditions = data.specialConditions;
      }
      if (data.productValue !== undefined) {
        updateData.productValue = data.productValue;
      }
      if (data.totalTickets !== undefined) {
        updateData.totalTickets = data.totalTickets;
      }

      await updateDoc(raffleRef, updateData);

      const updatedDoc = await getDoc(raffleRef);
      if (!updatedDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }

      return await convertRaffleDoc(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error updating raffle:', error);
      throw error;
    }
  },

  /**
   * Aprueba un sorteo (admin): define costo por ticket, número de tickets y activa la oportunidad
   */
  async approveRaffle(
    id: string,
    params: { costPerTicket: number; totalTickets: number }
  ): Promise<Raffle> {
    try {
      const raffleRef = doc(db, 'raffles', id);
      await updateDoc(raffleRef, {
        productValue: params.costPerTicket,
        totalTickets: params.totalTickets,
        status: RaffleStatus.ACTIVE,
        updatedAt: serverTimestamp(),
        activatedAt: serverTimestamp(),
      });

      const updatedDoc = await getDoc(raffleRef);
      if (!updatedDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }

      return await convertRaffleDoc(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error approving raffle:', error);
      throw error;
    }
  },

  /**
   * Rechaza un sorteo (admin)
   */
  async rejectRaffle(id: string, _reason?: string): Promise<Raffle> {
    try {
      const raffleRef = doc(db, 'raffles', id);
      await updateDoc(raffleRef, {
        status: RaffleStatus.REJECTED,
        updatedAt: serverTimestamp(),
      });

      const updatedDoc = await getDoc(raffleRef);
      if (!updatedDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }

      return await convertRaffleDoc(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error rejecting raffle:', error);
      throw error;
    }
  },

  /**
   * Ejecuta el sorteo: elige ganador aleatorio, guarda winnerInfo y código único, marca FINISHED
   */
  async executeRaffle(
    id: string,
    params: { winnerTicketId: string; winnerInfo: Omit<WinnerInfo, 'deliveryEvidence'> & { deliveryEvidence?: any } }
  ): Promise<Raffle> {
    try {
      const raffleRef = doc(db, 'raffles', id);
      const winnerInfoForFirestore = {
        ...params.winnerInfo,
        notifiedAt: params.winnerInfo.notifiedAt || new Date(),
        deliveryStatus: params.winnerInfo.deliveryStatus || 'pending',
      };
      await updateDoc(raffleRef, {
        winnerTicketId: params.winnerTicketId,
        winnerInfo: winnerInfoForFirestore,
        status: RaffleStatus.FINISHED,
        updatedAt: serverTimestamp(),
        raffleExecutedAt: serverTimestamp(),
      });

      const updatedDoc = await getDoc(raffleRef);
      if (!updatedDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }

      return await convertRaffleDoc(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error executing raffle:', error);
      throw error;
    }
  },

  /**
   * Envía un sorteo para aprobación
   */
  async submitForApproval(id: string): Promise<Raffle> {
    try {
      const raffleRef = doc(db, 'raffles', id);
      await updateDoc(raffleRef, {
        status: RaffleStatus.PENDING_APPROVAL,
        updatedAt: serverTimestamp(),
      });

      const updatedDoc = await getDoc(raffleRef);
      if (!updatedDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }

      return await convertRaffleDoc(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error submitting raffle for approval:', error);
      throw error;
    }
  },

  /**
   * Registra el pago al organizador (admin): guarda fecha y URL de evidencia
   */
  async registerPaymentToOrganizer(
    id: string,
    params: { paymentEvidenceUrl: string }
  ): Promise<Raffle> {
    try {
      const raffleRef = doc(db, 'raffles', id);
      await updateDoc(raffleRef, {
        paymentToOrganizerAt: serverTimestamp(),
        paymentEvidenceUrl: params.paymentEvidenceUrl,
        updatedAt: serverTimestamp(),
      });

      const updatedDoc = await getDoc(raffleRef);
      if (!updatedDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }

      return await convertRaffleDoc(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error registering payment to organizer:', error);
      throw error;
    }
  },

  /**
   * Cancela un sorteo. Deja de mostrarse en panel admin y catálogo público.
   */
  async cancelRaffle(id: string, reason?: string): Promise<Raffle> {
    try {
      const raffleRef = doc(db, 'raffles', id);
      const updateData: Record<string, any> = {
        status: RaffleStatus.CANCELLED,
        updatedAt: serverTimestamp(),
      };
      if (reason && reason.trim()) {
        updateData.cancelReason = reason.trim();
      }
      await updateDoc(raffleRef, updateData);

      const updatedDoc = await getDoc(raffleRef);
      if (!updatedDoc.exists()) {
        throw new Error('Sorteo no encontrado');
      }

      return await convertRaffleDoc(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error cancelling raffle:', error);
      throw error;
    }
  },
};