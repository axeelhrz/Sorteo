import { collection, query, where, getDocs, getDoc, doc, orderBy, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shop, ShopStatus } from '@/types/shop';

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

// Helper para convertir documento de Firestore a Shop
const convertShopDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Shop => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    userId: data.userId || '',
    name: data.name || '',
    description: data.description,
    logo: data.logo,
    publicEmail: data.publicEmail,
    phone: data.phone,
    socialMedia: data.socialMedia,
    status: data.status || ShopStatus.PENDING,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  };
};

export const firebaseShopService = {
  /**
   * Obtiene una tienda por ID (para marketplace)
   */
  async getShopById(id: string): Promise<Shop> {
    try {
      const shopDoc = await getDoc(doc(db, 'shops', id));
      if (!shopDoc.exists()) {
        throw new Error('Shop not found');
      }
      return convertShopDoc(shopDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error fetching shop:', error);
      throw error;
    }
  },

  /**
   * Obtiene todas las tiendas verificadas (para marketplace)
   */
  async getVerifiedShops(): Promise<Shop[]> {
    try {
      const shopsRef = collection(db, 'shops');
      const q = query(shopsRef, where('status', '==', ShopStatus.VERIFIED));
      const snapshot = await getDocs(q);
      const shops = snapshot.docs.map((doc) => convertShopDoc(doc));
      // Ordenar por nombre alfabéticamente
      return shops.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching verified shops:', error);
      throw error;
    }
  },

  /**
   * Obtiene todas las tiendas (para marketplace)
   */
  async getAllShops(): Promise<Shop[]> {
    try {
      const shopsRef = collection(db, 'shops');
      const snapshot = await getDocs(shopsRef);
      const shops = snapshot.docs.map((doc) => convertShopDoc(doc));
      // Ordenar por nombre alfabéticamente
      return shops.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching all shops:', error);
      throw error;
    }
  },
};

