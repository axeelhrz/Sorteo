import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Raffle, RaffleStatus, WinnerInfo } from '@/types/raffle';
import { Product } from '@/types/product';
import { Shop } from '@/types/shop';

export interface RaffleFilters {
  category?: string;
  shopId?: string;
  status?: string;
  minValue?: number;
  maxValue?: number;
  deliveryType?: 'all' | 'delivery' | 'pickup';
  search?: string;
  sortBy?: 'newest' | 'closest' | 'price-asc' | 'price-desc';
  page?: number;
  limit?: number;
}

export interface PaginatedRaffles {
  data: Raffle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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

// Helper para convertir winnerInfo de Firestore
const convertWinnerInfo = (raw: any): WinnerInfo | undefined => {
  if (!raw || typeof raw !== 'object') return undefined;
  const deliveryEvidence = raw.deliveryEvidence
    ? {
        photoUrl: raw.deliveryEvidence.photoUrl || '',
        uploadedAt: convertTimestamp(raw.deliveryEvidence.uploadedAt),
        uploadedBy: raw.deliveryEvidence.uploadedBy || '',
        notes: raw.deliveryEvidence.notes,
        additionalPhotos: raw.deliveryEvidence.additionalPhotos,
      }
    : undefined;
  return {
    userId: raw.userId || '',
    userName: raw.userName,
    userEmail: raw.userEmail,
    ticketId: raw.ticketId || '',
    ticketNumber: raw.ticketNumber ?? 0,
    verificationCode: raw.verificationCode || '',
    notifiedAt: raw.notifiedAt ? convertTimestamp(raw.notifiedAt) : undefined,
    claimedAt: raw.claimedAt ? convertTimestamp(raw.claimedAt) : undefined,
    deliveryStatus: raw.deliveryStatus || 'pending',
    deliveryEvidence,
    deliveryConfirmedAt: raw.deliveryConfirmedAt ? convertTimestamp(raw.deliveryConfirmedAt) : undefined,
    deliveryConfirmedBy: raw.deliveryConfirmedBy,
    deliveryDeadline: raw.deliveryDeadline ? convertTimestamp(raw.deliveryDeadline) : undefined,
  };
};

// Helper para convertir documento de Firestore a Raffle
const convertRaffleDoc = async (docSnap: QueryDocumentSnapshot<DocumentData>): Promise<Raffle> => {
  const data = docSnap.data();
  const raffle: Raffle = {
    id: docSnap.id,
    shopId: data.shopId || '',
    productId: data.productId || '',
    productValue: data.productValue || 0,
    totalTickets: data.totalTickets || 0,
    soldTickets: data.soldTickets || 0,
    status: data.status || RaffleStatus.DRAFT,
    requiresDeposit: data.requiresDeposit || false,
    thumbnail: data.thumbnail,
    winnerTicketId: data.winnerTicketId,
    winnerInfo: convertWinnerInfo(data.winnerInfo),
    specialConditions: data.specialConditions,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
    activatedAt: data.activatedAt ? convertTimestamp(data.activatedAt) : undefined,
    raffleExecutedAt: data.raffleExecutedAt ? convertTimestamp(data.raffleExecutedAt) : undefined,
    paymentToOrganizerAt: data.paymentToOrganizerAt ? convertTimestamp(data.paymentToOrganizerAt) : undefined,
    paymentEvidenceUrl: data.paymentEvidenceUrl,
  };

  // Cargar relaciones si existen
  if (data.shopId) {
    try {
      const shopDoc = await getDoc(doc(db, 'shops', data.shopId));
      if (shopDoc.exists()) {
        const shopData = shopDoc.data();
        raffle.shop = {
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

  if (data.productId) {
    try {
      const productDoc = await getDoc(doc(db, 'products', data.productId));
      if (productDoc.exists()) {
        const productData = productDoc.data();
        raffle.product = {
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
          deliveryCost: productData.deliveryCost,
          pickupAddress: productData.pickupAddress,
          pickupDistrict: productData.pickupDistrict,
          pickupInStore: productData.pickupInStore,
          createdAt: convertTimestamp(productData.createdAt),
          updatedAt: convertTimestamp(productData.updatedAt),
        } as Product;
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
  }

  return raffle;
};

export const firebaseRaffleService = {
  /**
   * Obtiene sorteos activos con filtros y búsqueda
   */
  async getActiveRaffles(filters?: RaffleFilters): Promise<PaginatedRaffles> {
    try {
      const rafflesRef = collection(db, 'raffles');
      
      // Intentar consulta con filtro de status, pero si falla por índice, obtener todos y filtrar
      let allDocs;
      try {
        let q = query(rafflesRef, where('status', '==', RaffleStatus.ACTIVE));

        // Aplicar filtros adicionales
        if (filters?.shopId) {
          q = query(q, where('shopId', '==', filters.shopId));
        }

        // Intentar ordenar si no hay filtro de shopId (para evitar problemas de índices compuestos)
        if (!filters?.shopId) {
          try {
            if (filters?.sortBy === 'newest') {
              q = query(q, orderBy('createdAt', 'desc'));
            } else if (filters?.sortBy === 'closest') {
              q = query(q, orderBy('soldTickets', 'desc'));
            } else if (filters?.sortBy === 'price-asc') {
              q = query(q, orderBy('productValue', 'asc'));
            } else if (filters?.sortBy === 'price-desc') {
              q = query(q, orderBy('productValue', 'desc'));
            } else {
              q = query(q, orderBy('createdAt', 'desc'));
            }
            allDocs = await getDocs(q);
          } catch (orderError: any) {
            // Si falla el orderBy, intentar sin ordenar
            console.warn('Error con orderBy, obteniendo sin ordenar:', orderError);
            if (filters?.shopId) {
              q = query(rafflesRef, where('status', '==', RaffleStatus.ACTIVE), where('shopId', '==', filters.shopId));
            } else {
              q = query(rafflesRef, where('status', '==', RaffleStatus.ACTIVE));
            }
            allDocs = await getDocs(q);
          }
        } else {
          allDocs = await getDocs(q);
        }
      } catch (queryError: any) {
        // Si falla la consulta con where, obtener todos y filtrar en memoria
        console.warn('Error en consulta con where, obteniendo todos los sorteos:', queryError);
        const allRafflesQuery = query(rafflesRef);
        const allRafflesSnapshot = await getDocs(allRafflesQuery);
        
        // Filtrar por status activo en memoria
        allDocs = {
          docs: allRafflesSnapshot.docs.filter(doc => {
            const status = doc.data().status;
            return status === RaffleStatus.ACTIVE || status === 'active';
          })
        } as any;
        
        console.log(`📊 Sorteos activos encontrados después de filtrar: ${allDocs.docs.length} de ${allRafflesSnapshot.docs.length} totales`);
      }

      let raffles: Raffle[] = [];

      // Convertir documentos
      for (const docSnap of allDocs.docs) {
        try {
          const raffle = await convertRaffleDoc(docSnap);
          raffles.push(raffle);
        } catch (error) {
          console.error('Error converting raffle doc:', error);
        }
      }
      
      console.log(`✅ Sorteos activos cargados: ${raffles.length}`);

      // Aplicar filtros que requieren los datos completos
      if (filters?.category) {
        raffles = raffles.filter((r) => r.product?.category === filters.category);
      }

      if (filters?.minValue !== undefined) {
        raffles = raffles.filter((r) => r.productValue >= filters.minValue!);
      }

      if (filters?.maxValue !== undefined) {
        raffles = raffles.filter((r) => r.productValue <= filters.maxValue!);
      }

      if (filters?.deliveryType && filters.deliveryType !== 'all') {
        if (filters.deliveryType === 'delivery') {
          raffles = raffles.filter((r) => r.product?.hasDelivery === true);
        } else if (filters.deliveryType === 'pickup') {
          raffles = raffles.filter((r) => r.product?.pickupInStore === true);
        }
      }

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        raffles = raffles.filter(
          (r) =>
            r.product?.name.toLowerCase().includes(searchLower) ||
            r.product?.description.toLowerCase().includes(searchLower) ||
            r.shop?.name.toLowerCase().includes(searchLower),
        );
      }

      // Ordenar en memoria si hay filtro de shopId o si no se pudo ordenar en la consulta
      if (filters?.shopId || filters?.sortBy) {
        if (filters?.sortBy === 'newest') {
          raffles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } else if (filters?.sortBy === 'closest') {
          raffles.sort((a, b) => b.soldTickets - a.soldTickets);
        } else if (filters?.sortBy === 'price-asc') {
          raffles.sort((a, b) => a.productValue - b.productValue);
        } else if (filters?.sortBy === 'price-desc') {
          raffles.sort((a, b) => b.productValue - a.productValue);
        }
      }

      // Aplicar paginación manual
      const pageSize = filters?.limit || 12;
      const page = filters?.page || 1;
      const offset = (page - 1) * pageSize;
      const total = raffles.length;
      const totalPages = Math.ceil(total / pageSize);
      const paginatedRaffles = raffles.slice(offset, offset + pageSize);

      return {
        data: paginatedRaffles,
        total,
        page,
        limit: pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching active raffles:', error);
      throw error;
    }
  },

  /**
   * Obtiene un sorteo específico por ID (público)
   */
  async getRaffleById(id: string): Promise<Raffle> {
    try {
      const raffleDoc = await getDoc(doc(db, 'raffles', id));
      if (!raffleDoc.exists()) {
        throw new Error('Raffle not found');
      }
      return await convertRaffleDoc(raffleDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error fetching raffle:', error);
      throw error;
    }
  },

  /**
   * Obtiene sorteos de un organizador específico (para el dashboard del organizador)
   * Incluye todos los estados: borradores, pendientes, activos, finalizados, etc.
   */
  async getRafflesByShop(shopId: string, filters?: Omit<RaffleFilters, 'shopId'>): Promise<PaginatedRaffles> {
    try {
      const rafflesRef = collection(db, 'raffles');
      // Obtener TODOS los sorteos del organizador (sin filtro de status)
      let q = query(rafflesRef, where('shopId', '==', shopId));

      const allDocs = await getDocs(q);
      let raffles: Raffle[] = [];

      for (const docSnap of allDocs.docs) {
        const raffle = await convertRaffleDoc(docSnap);
        raffles.push(raffle);
      }

      // Aplicar búsqueda si existe
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        raffles = raffles.filter(
          (r) =>
            r.product?.name.toLowerCase().includes(searchLower) ||
            r.product?.description.toLowerCase().includes(searchLower),
        );
      }

      // Ordenar en memoria (por defecto, más recientes primero)
      if (filters?.sortBy === 'newest') {
        raffles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      } else if (filters?.sortBy === 'closest') {
        raffles.sort((a, b) => b.soldTickets - a.soldTickets);
      } else {
        raffles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }

      // Paginación
      const pageSize = filters?.limit || 12;
      const page = filters?.page || 1;
      const offset = (page - 1) * pageSize;
      const total = raffles.length;
      const totalPages = Math.ceil(total / pageSize);
      const paginatedRaffles = raffles.slice(offset, offset + pageSize);

      return {
        data: paginatedRaffles,
        total,
        page,
        limit: pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching shop raffles:', error);
      throw error;
    }
  },

  /**
   * Obtiene categorías disponibles para filtrar
   */
  async getCategories(): Promise<string[]> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);

      const categories = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.category) {
          categories.add(data.category);
        }
      });

      return Array.from(categories).sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Obtiene organizadores con sorteos activos
   */
  async getShopsWithActiveRaffles(): Promise<Array<{ id: string; name: string }>> {
    try {
      const rafflesRef = collection(db, 'raffles');
      const q = query(rafflesRef, where('status', '==', RaffleStatus.ACTIVE));
      const snapshot = await getDocs(q);

      const shopIds = new Set<string>();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.shopId) {
          shopIds.add(data.shopId);
        }
      });

    // Obtener información de los organizadores
    const shops: Array<{ id: string; name: string }> = [];
    for (const shopId of shopIds) {
        try {
          const shopDoc = await getDoc(doc(db, 'shops', shopId));
          if (shopDoc.exists()) {
            const shopData = shopDoc.data();
      shops.push({
        id: shopDoc.id,
        name: shopData.name || 'Organizador sin nombre',
      });
          }
        } catch (error) {
          console.error(`Error loading shop ${shopId}:`, error);
        }
      }

      return shops.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching shops:', error);
      return [];
    }
  },
};