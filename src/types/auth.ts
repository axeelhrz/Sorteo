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