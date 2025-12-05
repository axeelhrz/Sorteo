import { firebaseProductService } from './firebase-product-service';
import { Product, CreateProductDto, UpdateProductDto } from '@/types/product';

export const productService = {
  // Operaciones de lectura del marketplace usan Firebase
  async getProductsByShop(shopId: string): Promise<Product[]> {
    return firebaseProductService.getProductsByShop(shopId);
  },

  async getActiveProductsByShop(shopId: string): Promise<Product[]> {
    return firebaseProductService.getActiveProductsByShop(shopId);
  },

  async getProductById(id: string): Promise<Product> {
    return firebaseProductService.getProductById(id);
  },

  async getAllProducts(): Promise<Product[]> {
    return firebaseProductService.getAllProducts();
  },

  // Operaciones de escritura usan Firebase
  async createProduct(data: CreateProductDto): Promise<Product> {
    return firebaseProductService.createProduct(data);
  },

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    return firebaseProductService.updateProduct(id, data);
  },

  async deactivateProduct(id: string): Promise<Product> {
    return firebaseProductService.deactivateProduct(id);
  },
};