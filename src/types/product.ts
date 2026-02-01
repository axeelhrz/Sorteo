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
  images?: string[]; // Fotos adicionales del producto
  status: ProductStatus;
  hasDelivery?: boolean;
  deliveryZones?: string;
  deliveryCost?: number; // Monto fijo de delivery (opcional; si no se indica, costo va a cuenta del organizador)
  pickupAddress?: string;
  pickupDistrict?: string;
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
  images?: string[];
  hasDelivery?: boolean;
  deliveryZones?: string;
  deliveryCost?: number;
  pickupAddress?: string;
  pickupDistrict?: string;
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
  images?: string[];
  hasDelivery?: boolean;
  deliveryZones?: string;
  deliveryCost?: number;
  pickupAddress?: string;
  pickupDistrict?: string;
  pickupInStore?: boolean;
}