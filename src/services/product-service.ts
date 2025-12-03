import { apiClient } from '@/lib/api-client';
import { Product, CreateProductDto, UpdateProductDto } from '@/types/product';

export const productService = {
  async getProductsByShop(shopId: string): Promise<Product[]> {
    const response = await apiClient.get(`/products?shopId=${shopId}`);
    return response.data;
  },

  async getActiveProductsByShop(shopId: string): Promise<Product[]> {
    const response = await apiClient.get(`/products/shop/${shopId}/active`);
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  async deactivateProduct(id: string): Promise<Product> {
    const response = await apiClient.put(`/products/${id}/deactivate`, {});
    return response.data;
  },

  async getAllProducts(): Promise<Product[]> {
    const response = await apiClient.get('/products');
    return response.data;
  },
};