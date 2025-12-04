import axios, { AxiosInstance } from 'axios';

// Asegurar que la URL sea absoluta y termine con /api
const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  
  // Si la URL no empieza con http:// o https://, agregar https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.warn('⚠️ NEXT_PUBLIC_API_URL no tiene protocolo, usando https://');
    return `https://${url}`;
  }
  
  // Asegurar que termine con /api
  if (!url.endsWith('/api')) {
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    return `${cleanUrl}/api`;
  }
  
  return url;
};

const API_URL = getApiUrl();

// Log para debugging (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API URL configurada:', API_URL);
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token a las peticiones
    this.client.interceptors.request.use((config) => {
      try {
        const token = localStorage.getItem('token');
        console.log('API Request - Token from localStorage:', token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('API Request - Authorization header set:', config.headers.Authorization);
        } else {
          console.log('API Request - No token found');
        }
        // No sobrescribir Content-Type si es FormData (para uploads)
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
      } catch (error) {
        console.error('Error reading token from localStorage:', error);
      }
      return config;
    });

    // Interceptor para manejar errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem('token');
        }
        return Promise.reject(error);
      },
    );
  }

  async register(data: any) {
    return this.client.post('/auth/register', data);
  }

  async login(data: any) {
    return this.client.post('/auth/login', data);
  }

  async getProfile() {
    return this.client.get('/auth/profile');
  }

  async logout() {
    return this.client.post('/auth/logout');
  }

  async get(endpoint: string, config?: any) {
    return this.client.get(endpoint, config);
  }

  async post(endpoint: string, data: any, config?: any) {
    return this.client.post(endpoint, data, config);
  }

  async put(endpoint: string, data: any) {
    return this.client.put(endpoint, data);
  }

  async delete(endpoint: string) {
    return this.client.delete(endpoint);
  }
}

export const apiClient = new ApiClient();