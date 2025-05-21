
import api from './index';

export interface UserData {
  id: number;
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  locationId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: UserData;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  locationId?: number | null;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData: RegisterData): Promise<LoginResponse> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async (): Promise<UserData> => {
  const response = await api.get('/auth/user');
  return response.data;
};

export const getUsers = async (): Promise<UserData[]> => {
  const response = await api.get('/auth/users');
  return response.data;
};

export const createUser = async (userData: RegisterData): Promise<UserData> => {
  const response = await api.post('/auth/users', userData);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<RegisterData>): Promise<UserData> => {
  const response = await api.put(`/auth/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/auth/users/${id}`);
  return response.data;
};
