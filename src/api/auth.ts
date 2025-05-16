
import api from './index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  isAdmin: boolean;
  token: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getUserProfile = async (): Promise<AuthResponse> => {
  const response = await api.get('/auth/profile');
  return response.data;
};
