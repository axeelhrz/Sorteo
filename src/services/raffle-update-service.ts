import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { RaffleStatus } from '@/types/raffle';

/**
 * Servicio para actualizar y eliminar sorteos
 */
export const raffleUpdateService = {
  /**
   * Actualiza el estado de un sorteo
   */
  async updateRaffleStatus(raffleId: string, status: RaffleStatus): Promise<void> {
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      await updateDoc(raffleRef, {
        status,
        updatedAt: serverTimestamp(),
        ...(status === 'active' && { activatedAt: serverTimestamp() }),
      });
    } catch (error) {
      console.error('Error updating raffle status:', error);
      throw error;
    }
  },

  /**
   * Activa un sorteo (cambia de draft a pending_approval)
   */
  async activateRaffle(raffleId: string): Promise<void> {
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      await updateDoc(raffleRef, {
        status: RaffleStatus.PENDING_APPROVAL,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error activating raffle:', error);
      throw error;
    }
  },

  /**
   * Elimina un sorteo
   */
  async deleteRaffle(raffleId: string): Promise<void> {
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      await deleteDoc(raffleRef);
    } catch (error) {
      console.error('Error deleting raffle:', error);
      throw error;
    }
  },

  /**
   * Pausa un sorteo
   */
  async pauseRaffle(raffleId: string): Promise<void> {
    try {
      const raffleRef = doc(db, 'raffles', raffleId);
      await updateDoc(raffleRef, {
        status: RaffleStatus.PAUSED,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error pausing raffle:', error);
      throw error;
    }
  },
};