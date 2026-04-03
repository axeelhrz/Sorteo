export enum OrganizerStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  BLOCKED = 'blocked',
}

// Mantener ShopStatus como alias para compatibilidad temporal
export const ShopStatus = OrganizerStatus;

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  whatsapp?: string;
  website?: string;
  /** Texto libre (p. ej. sincronizado desde crear oportunidad) */
  other?: string;
}

export interface Organizer {
  id: string;
  userId: string;
  name: string;
  description?: string;
  logo?: string;
  publicEmail?: string;
  phone?: string;
  socialMedia?: SocialMedia; // Actualizado a objeto estructurado
  status: OrganizerStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Mantener Shop como alias para compatibilidad temporal
export type Shop = Organizer;

export interface UpdateOrganizerDto {
  name?: string;
  description?: string;
  logo?: string;
  publicEmail?: string;
  phone?: string;
  socialMedia?: SocialMedia; // Actualizado a objeto estructurado
}

// Mantener UpdateShopDto como alias para compatibilidad temporal
export type UpdateShopDto = UpdateOrganizerDto;