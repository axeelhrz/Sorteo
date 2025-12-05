import { firebaseRaffleWriteService } from './firebase-raffle-write-service';
import { firebaseRaffleService } from './firebase-raffle-service';
import { Raffle, CreateRaffleDto, UpdateRaffleDto } from '@/types/raffle';

export const raffleService = {
  // Operaciones de lectura usan firebase-raffle-service
  async getRafflesByShop(shopId: string): Promise<Raffle[]> {
    const result = await firebaseRaffleService.getRafflesByShop(shopId, { limit: 100 });
    return result.data;
  },

  async getRaffleById(id: string): Promise<Raffle> {
    return firebaseRaffleService.getRaffleById(id);
  },

  async getActiveRaffles(): Promise<Raffle[]> {
    const result = await firebaseRaffleService.getActiveRaffles({ limit: 100 });
    return result.data;
  },

  async getAllRaffles(): Promise<Raffle[]> {
    // Obtener todos los sorteos (sin filtro de status)
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('@/lib/firebase');
    const rafflesRef = collection(db, 'raffles');
    const snapshot = await getDocs(rafflesRef);
    const raffles: Raffle[] = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      raffles.push({
        id: docSnap.id,
        shopId: data.shopId || '',
        productId: data.productId || '',
        productValue: data.productValue || 0,
        totalTickets: data.totalTickets || 0,
        soldTickets: data.soldTickets || 0,
        status: data.status || 'draft',
        requiresDeposit: data.requiresDeposit || false,
        winnerTicketId: data.winnerTicketId,
        specialConditions: data.specialConditions,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        activatedAt: data.activatedAt?.toDate(),
        raffleExecutedAt: data.raffleExecutedAt?.toDate(),
      } as Raffle);
    }
    
    return raffles;
  },

  // Operaciones de escritura usan firebase-raffle-write-service
  async createRaffle(data: CreateRaffleDto): Promise<Raffle> {
    return firebaseRaffleWriteService.createRaffle(data);
  },

  async updateRaffle(id: string, data: UpdateRaffleDto): Promise<Raffle> {
    return firebaseRaffleWriteService.updateRaffle(id, data);
  },

  async submitForApproval(id: string): Promise<Raffle> {
    return firebaseRaffleWriteService.submitForApproval(id);
  },

  async cancelRaffle(id: string): Promise<Raffle> {
    return firebaseRaffleWriteService.cancelRaffle(id);
  },
};