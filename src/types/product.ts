export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  value: number;
  height: number;
  width: number;
  depth: number;
  requiresDeposit: boolean;
  category?: string;
  mainImage?: string;
  status: ProductStatus;
  hasDelivery?: boolean;
  deliveryZones?: string;
  pickupInStore?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  shopId: string;
  name: string;
  description: string;
  value: number;
  height: number;
  width: number;
  depth: number;
  category?: string;
  mainImage?: string;
  hasDelivery?: boolean;
  deliveryZones?: string;
  pickupInStore?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  value?: number;
  height?: number;
  width?: number;
  depth?: number;
  category?: string;
  mainImage?: string;
  hasDelivery?: boolean;
  deliveryZones?: string;
  pickupInStore?: boolean;
}