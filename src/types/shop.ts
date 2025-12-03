export enum ShopStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  BLOCKED = 'blocked',
}

export interface Shop {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logo?: string;
  publicEmail?: string;
  phone?: string;
  socialMedia?: string;
  status: ShopStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateShopDto {
  name?: string;
  description?: string;
  logo?: string;
  publicEmail?: string;
  phone?: string;
  socialMedia?: string;
}