import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';

export interface TicketAssignmentResult {
  success: boolean;
  ticketNumbers: number[];
  ticketIds: string[];
  error?: string;
}

export async function assignTicketsToUserAdmin(
  raffleId: string,
  userId: string,
  paymentId: string,
  ticketQuantity: number
): Promise<TicketAssignmentResult> {
  const adminDb = getAdminFirestore();

  try {
    const result = await adminDb.runTransaction(async (transaction) => {
      const raffleRef = adminDb.collection('raffles').doc(raffleId);
      const raffleDoc = await transaction.get(raffleRef);
      if (!raffleDoc.exists) {
        throw new Error('Sorteo no encontrado');
      }

      const raffleData = raffleDoc.data() || {};
      const totalTickets = raffleData.totalTickets || 0;
      const soldTickets = raffleData.soldTickets || 0;
      const availableTickets = totalTickets - soldTickets;

      if (availableTickets < ticketQuantity) {
        throw new Error(
          `No hay suficientes tickets disponibles. Solicitados: ${ticketQuantity}, Disponibles: ${availableTickets}`
        );
      }

      const ticketsRef = adminDb.collection('tickets');
      const existingTicketsSnapshot = await transaction.get(
        ticketsRef.where('raffleId', '==', raffleId)
      );

      const usedNumbers = new Set<number>();
      existingTicketsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (typeof data.ticketNumber === 'number') {
          usedNumbers.add(data.ticketNumber);
        }
      });

      const assignedNumbers: number[] = [];
      const ticketIds: string[] = [];
      for (let i = 0; i < ticketQuantity; i++) {
        let ticketNumber: number;
        let attempts = 0;
        const maxAttempts = totalTickets * 2 || 1000;
        do {
          ticketNumber = Math.floor(Math.random() * totalTickets) + 1;
          attempts++;
          if (attempts > maxAttempts) {
            throw new Error('No se pudieron generar números de ticket únicos');
          }
        } while (usedNumbers.has(ticketNumber) || assignedNumbers.includes(ticketNumber));

        assignedNumbers.push(ticketNumber);
        usedNumbers.add(ticketNumber);
      }

      assignedNumbers.sort((a, b) => a - b);

      for (const ticketNumber of assignedNumbers) {
        const ticketRef = ticketsRef.doc();
        transaction.set(ticketRef, {
          raffleId,
          userId,
          paymentId,
          ticketNumber,
          purchaseDate: FieldValue.serverTimestamp(),
          status: 'active',
          createdAt: FieldValue.serverTimestamp(),
        });
        ticketIds.push(ticketRef.id);
      }

      transaction.update(raffleRef, {
        soldTickets: soldTickets + ticketQuantity,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { assignedNumbers, ticketIds };
    });

    return {
      success: true,
      ticketNumbers: result.assignedNumbers,
      ticketIds: result.ticketIds,
    };
  } catch (error: any) {
    console.error('assignTicketsToUserAdmin error:', error);
    return {
      success: false,
      ticketNumbers: [],
      ticketIds: [],
      error: error.message || 'Error al asignar tickets',
    };
  }
}
