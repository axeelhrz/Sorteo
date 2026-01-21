import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';

/**
 * Ticket Assignment Service
 * 
 * Handles automatic ticket assignment when payments are approved
 */

export interface Ticket {
  id: string;
  raffleId: string;
  userId: string;
  ticketNumber: number;
  paymentId: string;
  purchaseDate: Date;
  status: 'active' | 'winner' | 'expired';
  createdAt: Date;
}

export interface TicketAssignmentResult {
  success: boolean;
  ticketNumbers: number[];
  ticketIds: string[];
  error?: string;
}

export const ticketAssignmentService = {
  /**
   * Assign tickets to user after payment approval
   */
  async assignTicketsToUser(
    raffleId: string,
    userId: string,
    paymentId: string,
    ticketQuantity: number
  ): Promise<TicketAssignmentResult> {
    try {
      console.log(`Assigning ${ticketQuantity} tickets for raffle ${raffleId} to user ${userId}`);

      // Use transaction to ensure atomicity
      const result = await runTransaction(db, async (transaction) => {
        // 1. Get raffle document
        const raffleRef = doc(db, 'raffles', raffleId);
        const raffleDoc = await transaction.get(raffleRef);

        if (!raffleDoc.exists()) {
          throw new Error('Raffle not found');
        }

        const raffleData = raffleDoc.data();
        const totalTickets = raffleData.totalTickets || 0;
        const soldTickets = raffleData.soldTickets || 0;
        const availableTickets = totalTickets - soldTickets;

        // 2. Verify tickets are available
        if (availableTickets < ticketQuantity) {
          throw new Error(
            `Not enough tickets available. Requested: ${ticketQuantity}, Available: ${availableTickets}`
          );
        }

        // 3. Get existing ticket numbers for this raffle
        const ticketsRef = collection(db, 'tickets');
        const existingTicketsQuery = query(ticketsRef, where('raffleId', '==', raffleId));
        const existingTicketsSnapshot = await getDocs(existingTicketsQuery);

        const usedNumbers = new Set<number>();
        existingTicketsSnapshot.docs.forEach((doc) => {
          const ticketData = doc.data();
          usedNumbers.add(ticketData.ticketNumber);
        });

        // 4. Generate unique ticket numbers
        const assignedNumbers: number[] = [];
        const ticketIds: string[] = [];

        for (let i = 0; i < ticketQuantity; i++) {
          let ticketNumber: number;
          let attempts = 0;
          const maxAttempts = totalTickets * 2; // Prevent infinite loop

          do {
            ticketNumber = Math.floor(Math.random() * totalTickets) + 1;
            attempts++;

            if (attempts > maxAttempts) {
              throw new Error('Could not generate unique ticket numbers');
            }
          } while (usedNumbers.has(ticketNumber) || assignedNumbers.includes(ticketNumber));

          assignedNumbers.push(ticketNumber);
          usedNumbers.add(ticketNumber);
        }

        // Sort ticket numbers for better UX
        assignedNumbers.sort((a, b) => a - b);

        // 5. Create ticket documents
        for (const ticketNumber of assignedNumbers) {
          const ticketData = {
            raffleId,
            userId,
            ticketNumber,
            paymentId,
            purchaseDate: serverTimestamp(),
            status: 'active',
            createdAt: serverTimestamp(),
          };

          const ticketRef = doc(collection(db, 'tickets'));
          transaction.set(ticketRef, ticketData);
          ticketIds.push(ticketRef.id);
        }

        // 6. Update raffle sold tickets counter
        transaction.update(raffleRef, {
          soldTickets: soldTickets + ticketQuantity,
          updatedAt: serverTimestamp(),
        });

        return { assignedNumbers, ticketIds };
      });

      console.log(`✅ Successfully assigned tickets: ${result.assignedNumbers.join(', ')}`);

      return {
        success: true,
        ticketNumbers: result.assignedNumbers,
        ticketIds: result.ticketIds,
      };
    } catch (error: any) {
      console.error('Error assigning tickets:', error);
      return {
        success: false,
        ticketNumbers: [],
        ticketIds: [],
        error: error.message || 'Error al asignar tickets',
      };
    }
  },

  /**
   * Get user's tickets for a specific raffle
   */
  async getUserTicketsForRaffle(userId: string, raffleId: string): Promise<Ticket[]> {
    try {
      const ticketsRef = collection(db, 'tickets');
      const q = query(
        ticketsRef,
        where('userId', '==', userId),
        where('raffleId', '==', raffleId)
      );

      const snapshot = await getDocs(q);
      const tickets: Ticket[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        tickets.push({
          id: doc.id,
          raffleId: data.raffleId,
          userId: data.userId,
          ticketNumber: data.ticketNumber,
          paymentId: data.paymentId,
          purchaseDate: data.purchaseDate?.toDate() || new Date(),
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      return tickets.sort((a, b) => a.ticketNumber - b.ticketNumber);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      return [];
    }
  },

  /**
   * Get all user's tickets across all raffles
   */
  async getAllUserTickets(userId: string): Promise<Ticket[]> {
    try {
      const ticketsRef = collection(db, 'tickets');
      const q = query(ticketsRef, where('userId', '==', userId));

      const snapshot = await getDocs(q);
      const tickets: Ticket[] = [];

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        tickets.push({
          id: doc.id,
          raffleId: data.raffleId,
          userId: data.userId,
          ticketNumber: data.ticketNumber,
          paymentId: data.paymentId,
          purchaseDate: data.purchaseDate?.toDate() || new Date(),
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      return tickets.sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
    } catch (error) {
      console.error('Error fetching all user tickets:', error);
      return [];
    }
  },

  /**
   * Get ticket count for a raffle
   */
  async getTicketCountForRaffle(raffleId: string): Promise<number> {
    try {
      const ticketsRef = collection(db, 'tickets');
      const q = query(ticketsRef, where('raffleId', '==', raffleId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error counting tickets:', error);
      return 0;
    }
  },

  /**
   * Check if a ticket number is available
   */
  async isTicketNumberAvailable(raffleId: string, ticketNumber: number): Promise<boolean> {
    try {
      const ticketsRef = collection(db, 'tickets');
      const q = query(
        ticketsRef,
        where('raffleId', '==', raffleId),
        where('ticketNumber', '==', ticketNumber)
      );

      const snapshot = await getDocs(q);
      return snapshot.empty;
    } catch (error) {
      console.error('Error checking ticket availability:', error);
      return false;
    }
  },

  /**
   * Mark ticket as winner
   */
  async markTicketAsWinner(ticketId: string): Promise<void> {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        status: 'winner',
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error marking ticket as winner:', error);
      throw error;
    }
  },

  /**
   * Mark tickets as expired (when raffle ends without winner)
   */
  async markTicketsAsExpired(raffleId: string): Promise<void> {
    try {
      const ticketsRef = collection(db, 'tickets');
      const q = query(
        ticketsRef,
        where('raffleId', '==', raffleId),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      const batch = [];

      for (const docSnap of snapshot.docs) {
        batch.push(
          updateDoc(doc(db, 'tickets', docSnap.id), {
            status: 'expired',
            updatedAt: serverTimestamp(),
          })
        );
      }

      await Promise.all(batch);
    } catch (error) {
      console.error('Error marking tickets as expired:', error);
      throw error;
    }
  },
};