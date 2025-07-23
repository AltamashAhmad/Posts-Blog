import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterData, 
  DirectusResponse, 
  DirectusListResponse,
  DirectusError 
} from '../types';

class DirectusAPI {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_DIRECTUS_URL || 'http://localhost:8055';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError<DirectusError>) => {
        // Handle CORS errors
        if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
          console.error('CORS Error: Make sure Directus is configured to allow requests from http://localhost:5173');
        }
        
        if (error.response?.status === 401) {
          this.clearAuth();
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  private getToken(): string | null {
    return localStorage.getItem('directus_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('directus_token', token);
  }

  private clearAuth(): void {
    localStorage.removeItem('directus_token');
    localStorage.removeItem('directus_refresh_token');
    localStorage.removeItem('directus_user');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<DirectusResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    
    const { access_token, refresh_token } = response.data.data;
    this.setToken(access_token);
    localStorage.setItem('directus_refresh_token', refresh_token);
    
    return response.data.data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Get admin token first
      const adminToken = await this.getAdminToken();
      
      // Create user with role assigned using admin token
      const userCreateData = {
        ...userData,
        role: import.meta.env.VITE_USER_ROLE_ID,
        status: 'active'
      };
      
      const response = await axios.post(`${this.baseURL}/users`, userCreateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      // Then login with the same credentials
      return this.login({
        email: userData.email,
        password: userData.password,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  private async getAdminToken(): Promise<string> {
    const response = await axios.post(`${this.baseURL}/auth/login`, {
      email: import.meta.env.VITE_DIRECTUS_EMAIL,
      password: import.meta.env.VITE_DIRECTUS_PASSWORD,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.data?.data?.access_token) {
      throw new Error('Failed to authenticate admin');
    }

    return response.data.data.access_token;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.clearAuth();
    }
  }

  async getCurrentUser() {
    const response = await this.api.get('/users/me');
    const user = response.data.data;
    localStorage.setItem('directus_user', JSON.stringify(user));
    return user;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('directus_refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await this.api.post<DirectusResponse<AuthResponse>>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    );

    const { access_token } = response.data.data;
    this.setToken(access_token);
    
    return response.data.data;
  }

  // Generic CRUD methods
  async getItems<T>(collection: string, params?: Record<string, any>): Promise<T[]> {
    const response = await this.api.get<DirectusListResponse<T>>(
      `/items/${collection}`,
      { params }
    );
    return response.data.data;
  }

  async getItem<T>(collection: string, id: string, params?: Record<string, any>): Promise<T> {
    const response = await this.api.get<DirectusResponse<T>>(
      `/items/${collection}/${id}`,
      { params }
    );
    return response.data.data;
  }

  async createItem<T>(collection: string, data: any): Promise<T> {
    const response = await this.api.post<DirectusResponse<T>>(
      `/items/${collection}`,
      data
    );
    return response.data.data;
  }

  async updateItem<T>(collection: string, id: string, data: any): Promise<T> {
    const response = await this.api.patch<DirectusResponse<T>>(
      `/items/${collection}/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteItem(collection: string, id: string): Promise<void> {
    await this.api.delete(`/items/${collection}/${id}`);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCachedUser() {
    const userStr = localStorage.getItem('directus_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Test connection to Directus
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/server/ping`);
      if (response.data === 'pong') {
        return { success: true, message: 'Successfully connected to Directus' };
      }
      return { success: false, message: 'Unexpected response from Directus' };
    } catch (error: any) {
      return { 
        success: false, 
        message: `Failed to connect to Directus: ${error.message}` 
      };
    }
  }
}

// Create and export a singleton instance
export const directusAPI = new DirectusAPI();
export default directusAPI;
