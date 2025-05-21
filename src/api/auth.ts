
import api from './index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  locationId?: number | null;
}

export interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  locationId: number | null;
  name: string | null;
  token?: string;
}

export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post('/auth/login', credentials);
  const { token, user } = response.data;
  
  // Store token in localStorage
  localStorage.setItem('token', token);
  
  return user;
};

export const logout = async (): Promise<void> => {
  // Remove token from localStorage
  localStorage.removeItem('token');
};

export const getAuthStatus = async (): Promise<User | null> => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
};

// Nouvelles fonctions pour gérer les utilisateurs (admin)
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const createUser = async (userData: RegisterData): Promise<User> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<RegisterData>): Promise<User> => {
  const response = await api.put(`/auth/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/auth/users/${id}`);
};
