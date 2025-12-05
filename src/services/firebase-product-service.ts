import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, ProductStatus, CreateProductDto, UpdateProductDto } from '@/types/product';

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

// Helper para convertir documento de Firestore a Product
const convertProductDoc = (docSnap: QueryDocumentSnapshot<DocumentData>): Product => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    shopId: data.shopId || '',
    name: data.name || '',
    description: data.description || '',
    value: data.value || 0,
    height: data.height || 0,
    width: data.width || 0,
    depth: data.depth || 0,
    requiresDeposit: data.requiresDeposit || false,
    category: data.category,
    mainImage: data.mainImage,
    status: data.status || ProductStatus.INACTIVE,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  };
};

export const firebaseProductService = {
  /**
   * Obtiene productos por tienda (para marketplace)
   */
  async getProductsByShop(shopId: string): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      // Primero filtramos, luego ordenamos en memoria para evitar problemas de índices
      const q = query(
        productsRef,
        where('shopId', '==', shopId),
        where('status', '==', ProductStatus.ACTIVE),
      );
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map((doc) => convertProductDoc(doc));
      // Ordenar por fecha de creación descendente
      return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching products by shop:', error);
      throw error;
    }
  },

  /**
   * Obtiene productos activos por tienda
   */
  async getActiveProductsByShop(shopId: string): Promise<Product[]> {
    return this.getProductsByShop(shopId);
  },

  /**
   * Obtiene un producto por ID
   */
  async getProductById(id: string): Promise<Product> {
    try {
      const productDoc = await getDoc(doc(db, 'products', id));
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }
      return convertProductDoc(productDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los productos activos (para marketplace)
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('status', '==', ProductStatus.ACTIVE));
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map((doc) => convertProductDoc(doc));
      // Ordenar por fecha de creación descendente
      return products.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },

  /**
   * Crea un nuevo producto
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    try {
      const productsRef = collection(db, 'products');
      const productData = {
        shopId: data.shopId,
        name: data.name,
        description: data.description,
        value: data.value,
        height: data.height,
        width: data.width,
        depth: data.depth,
        requiresDeposit: data.height > 15 || data.width > 15 || data.depth > 15,
        category: data.category || null,
        mainImage: data.mainImage || null,
        status: ProductStatus.ACTIVE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(productsRef, productData);
      const productDoc = await getDoc(docRef);
      
      if (!productDoc.exists()) {
        throw new Error('Error al crear el producto');
      }

      return convertProductDoc(productDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Actualiza un producto existente
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    try {
      const productRef = doc(db, 'products', id);
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.value !== undefined) updateData.value = data.value;
      if (data.height !== undefined) updateData.height = data.height;
      if (data.width !== undefined) updateData.width = data.width;
      if (data.depth !== undefined) updateData.depth = data.depth;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.mainImage !== undefined) updateData.mainImage = data.mainImage;

      // Recalcular requiresDeposit si cambian las dimensiones
      if (data.height !== undefined || data.width !== undefined || data.depth !== undefined) {
        const productDoc = await getDoc(productRef);
        if (productDoc.exists()) {
          const currentData = productDoc.data();
          const height = data.height !== undefined ? data.height : currentData.height;
          const width = data.width !== undefined ? data.width : currentData.width;
          const depth = data.depth !== undefined ? data.depth : currentData.depth;
          updateData.requiresDeposit = height > 15 || width > 15 || depth > 15;
        }
      }

      await updateDoc(productRef, updateData);
      
      const updatedDoc = await getDoc(productRef);
      if (!updatedDoc.exists()) {
        throw new Error('Producto no encontrado');
      }

      return convertProductDoc(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  /**
   * Desactiva un producto
   */
  async deactivateProduct(id: string): Promise<Product> {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        status: ProductStatus.INACTIVE,
        updatedAt: serverTimestamp(),
      });

      const updatedDoc = await getDoc(productRef);
      if (!updatedDoc.exists()) {
        throw new Error('Producto no encontrado');
      }

      return convertProductDoc(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error deactivating product:', error);
      throw error;
    }
  },
};

