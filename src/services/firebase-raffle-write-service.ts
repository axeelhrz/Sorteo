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
import { Raffle, RaffleStatus, CreateRaffleDto, UpdateRaffleDto } from '@/types/raffle';
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
  };
};

export const firebaseRaffleWriteService = {
  /**
   * Crea un nuevo sorteo
   * Calcula automáticamente los tickets como el doble del valor del producto
   */
  async createRaffle(data: CreateRaffleDto): Promise<Raffle> {
    try {
      // Obtener el producto para calcular los tickets
      const productDoc = await getDoc(doc(db, 'products', data.productId));
      if (!productDoc.exists()) {
        throw new Error('Producto no encontrado');
      }

      const productData = productDoc.data() as Product;
      const productValue = productData.value || 0;
      
      // Calcular tickets: doble del valor del producto
      const totalTickets = Math.floor(productValue * 2);

      if (totalTickets <= 0) {
        throw new Error('El valor del producto debe ser mayor a 0');
      }

      const rafflesRef = collection(db, 'raffles');
      const raffleData = {
        shopId: data.shopId,
        productId: data.productId,
        productValue: productValue,
        totalTickets: totalTickets,
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
   * Cancela un sorteo
   */
  async cancelRaffle(id: string): Promise<Raffle> {
    try {
      const raffleRef = doc(db, 'raffles', id);
      await updateDoc(raffleRef, {
        status: RaffleStatus.CANCELLED,
        updatedAt: serverTimestamp(),
      });

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

