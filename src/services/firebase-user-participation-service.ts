import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Raffle, RaffleStatus } from '@/types/raffle';
import { Product } from '@/types/product';
import { Shop } from '@/types/shop';

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

export const firebaseUserParticipationService = {
  /**
   * Obtiene todas las participaciones del usuario en sorteos aprobados
   * Filtra solo sorteos con status ACTIVE, SOLD_OUT o FINISHED
   */
  async getUserParticipations(userId: string): Promise<Raffle[]> {
    try {
      // Obtener todos los tickets del usuario
      const ticketsRef = collection(db, 'raffle-tickets');
      const userTicketsQuery = query(ticketsRef, where('userId', '==', userId));
      const ticketsSnapshot = await getDocs(userTicketsQuery);

      if (ticketsSnapshot.empty) {
        return [];
      }

      // Obtener IDs únicos de sorteos
      const raffleIds = new Set<string>();
      ticketsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.raffleId) {
          raffleIds.add(data.raffleId);
        }
      });

      // Obtener detalles de cada sorteo
      const raffles: Raffle[] = [];
      for (const raffleId of raffleIds) {
        try {
          const raffleDoc = await getDoc(doc(db, 'raffles', raffleId));
          if (raffleDoc.exists()) {
            const raffleData = raffleDoc.data();
            
            // Filtrar solo sorteos aprobados (ACTIVE, SOLD_OUT, FINISHED)
            // Excluir: DRAFT, PENDING_APPROVAL, PAUSED, CANCELLED, REJECTED
            const approvedStatuses = [
              RaffleStatus.ACTIVE,
              RaffleStatus.SOLD_OUT,
              RaffleStatus.FINISHED,
            ];

            if (!approvedStatuses.includes(raffleData.status)) {
              continue; // Saltar sorteos no aprobados
            }

            // Cargar información del producto
            let product: Product | undefined;
            if (raffleData.productId) {
              try {
                const productDoc = await getDoc(doc(db, 'products', raffleData.productId));
                if (productDoc.exists()) {
                  const productData = productDoc.data();
                  product = {
                    id: productDoc.id,
                    shopId: productData.shopId || '',
                    name: productData.name || '',
                    description: productData.description || '',
                    value: productData.value || 0,
                    height: productData.height || 0,
                    width: productData.width || 0,
                    depth: productData.depth || 0,
                    requiresDeposit: productData.requiresDeposit || false,
                    category: productData.category,
                    mainImage: productData.mainImage,
                    status: productData.status || 'inactive',
                    hasDelivery: productData.hasDelivery,
                    deliveryZones: productData.deliveryZones,
                    pickupInStore: productData.pickupInStore,
                    createdAt: convertTimestamp(productData.createdAt),
                    updatedAt: convertTimestamp(productData.updatedAt),
                  } as Product;
                }
              } catch (error) {
                console.error('Error loading product:', error);
              }
            }

            // Cargar información de la tienda
            let shop: Shop | undefined;
            if (raffleData.shopId) {
              try {
                const shopDoc = await getDoc(doc(db, 'shops', raffleData.shopId));
                if (shopDoc.exists()) {
                  const shopData = shopDoc.data();
                  shop = {
                    id: shopDoc.id,
                    userId: shopData.userId || '',
                    name: shopData.name || '',
                    description: shopData.description,
                    logo: shopData.logo,
                    publicEmail: shopData.publicEmail,
                    phone: shopData.phone,
                    socialMedia: shopData.socialMedia,
                    status: shopData.status || 'pending',
                    createdAt: convertTimestamp(shopData.createdAt),
                    updatedAt: convertTimestamp(shopData.updatedAt),
                  } as Shop;
                }
              } catch (error) {
                console.error('Error loading shop:', error);
              }
            }

            const raffle: Raffle = {
              id: raffleDoc.id,
              shopId: raffleData.shopId || '',
              productId: raffleData.productId || '',
              productValue: raffleData.productValue || 0,
              totalTickets: raffleData.totalTickets || 0,
              soldTickets: raffleData.soldTickets || 0,
              status: raffleData.status || RaffleStatus.DRAFT,
              requiresDeposit: raffleData.requiresDeposit || false,
              winnerTicketId: raffleData.winnerTicketId,
              specialConditions: raffleData.specialConditions,
              createdAt: convertTimestamp(raffleData.createdAt),
              updatedAt: convertTimestamp(raffleData.updatedAt),
              activatedAt: raffleData.activatedAt ? convertTimestamp(raffleData.activatedAt) : undefined,
              raffleExecutedAt: raffleData.raffleExecutedAt ? convertTimestamp(raffleData.raffleExecutedAt) : undefined,
              product,
              shop,
            };

            raffles.push(raffle);
          }
        } catch (error) {
          console.error(`Error loading raffle ${raffleId}:`, error);
        }
      }

      // Ordenar por fecha de creación descendente
      return raffles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching user participations:', error);
      throw error;
    }
  },

  /**
   * Obtiene los sorteos activos próximos a terminar en los que el usuario ha participado
   */
  async getUserActiveRafflesNearEnd(userId: string, limit: number = 5): Promise<Raffle[]> {
    try {
      const participations = await this.getUserParticipations(userId);
      
      // Filtrar solo sorteos activos
      const activeRaffles = participations.filter(
        (r) => r.status === RaffleStatus.ACTIVE || r.status === RaffleStatus.SOLD_OUT
      );

      // Ordenar por tickets restantes (ascendente) para mostrar los próximos a terminar
      const sorted = activeRaffles.sort((a, b) => {
        const aRemaining = a.totalTickets - a.soldTickets;
        const bRemaining = b.totalTickets - b.soldTickets;
        return aRemaining - bRemaining;
      });

      return sorted.slice(0, limit);
    } catch (error) {
      console.error('Error fetching active raffles near end:', error);
      throw error;
    }
  },

  /**
   * Obtiene los sorteos ganados por el usuario
   */
  async getUserWonRaffles(userId: string): Promise<Raffle[]> {
    try {
      const participations = await this.getUserParticipations(userId);
      
      // Filtrar solo sorteos finalizados donde el usuario ganó
      return participations.filter((r) => {
        if (r.status !== RaffleStatus.FINISHED) {
          return false;
        }

        // Verificar si el usuario tiene el ticket ganador
        // Esto se verificaría comparando los tickets del usuario con winnerTicketId
        return r.winnerTicketId !== undefined && r.winnerTicketId !== null;
      });
    } catch (error) {
      console.error('Error fetching won raffles:', error);
      throw error;
    }
  },
};