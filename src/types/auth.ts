/**
 * Perfiles de la plataforma:
 *
 * ADMINISTRADOR (admin):
 * - Aprueba oportunidades (sorteos)
 * - Aprueba cantidad/ratio de tickets
 * - Aprueba precio de tickets
 * - Gestiona pago al organizador
 *
 * ORGANIZADOR (organizer / shop):
 * - Nombre, correo, contraseña del organizador
 * - Solicita creación de oportunidades (sorteos)
 * - NO puede participar en la compra de tickets
 *
 * USUARIO (user):
 * - Nombre, correo, contraseña del usuario
 * - NO puede solicitar creación de sorteos
 * - Puede comprar tickets en sorteos activos
 */
export enum UserRole {
  ADMIN = 'admin',
  ORGANIZER = 'organizer',
  SHOP = 'organizer', // Alias para compatibilidad
  USER = 'user',
}

export interface User {
  id: string;
  uid: string; // Firebase Auth uid (alias for id)
  name: string;
  email: string;
  role: UserRole;
  shopId?: string; // Optional shop ID for organizers
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}