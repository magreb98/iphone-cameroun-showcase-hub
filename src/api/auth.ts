
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
  name?: string | null;
  whatsappNumber?: string | null;
}

export interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  locationId: number | null;
  name: string | null;
  whatsappNumber: string | null;
  token?: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  whatsappNumber?: string;
}

export interface ForgotPasswordData {
  whatsappNumber: string;
}

export interface VerifyResetCodeData {
  whatsappNumber: string;
  code: string;
}

export interface ResetPasswordData {
  whatsappNumber: string;
  code: string;
  newPassword: string;
}

export const login = async (credentials: LoginCredentials): Promise<User> => {
  const response = await api.post('/auth/login', credentials);
  const { token, user } = response.data;
  
  // Store token in localStorage
  localStorage.setItem('token', token);
  
  return { ...user, token };
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

// Profile management
export const updateProfile = async (profileData: ProfileUpdateData): Promise<User> => {
  const response = await api.put('/auth/profile', profileData);
  return response.data.user;
};

// Password reset functions
export const requestPasswordReset = async (data: ForgotPasswordData): Promise<{ message: string; verificationCode?: string }> => {
  const response = await api.post('/auth/forgot-password', data);
  return response.data;
};

export const verifyResetCode = async (data: VerifyResetCodeData): Promise<{ message: string; userId: number }> => {
  const response = await api.post('/auth/verify-reset-code', data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData): Promise<{ message: string }> => {
  const response = await api.post('/auth/reset-password', data);
  return response.data;
};

// User management functions (admin)
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
