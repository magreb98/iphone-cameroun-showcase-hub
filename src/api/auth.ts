
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
  try {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    if (!token || !user) {
      throw new Error('Réponse invalide du serveur');
    }
    
    // Configurer le token pour les requêtes futures
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { ...user, token };
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    
    // Nettoyer les tokens en cas d'erreur
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Nettoyer les tokens localement
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('admin_token');
    localStorage.removeItem('token');
    
    // Optionnel: appel API pour invalider le token côté serveur
    // await api.post('/auth/logout');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    // Même en cas d'erreur, on nettoie localement
  }
};

export const getAuthStatus = async (): Promise<User | null> => {
  try {
    // Vérifier si un token existe
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    // Configurer l'en-tête d'autorisation si pas déjà fait
    if (!api.defaults.headers.common['Authorization']) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la vérification du statut d\'authentification:', error);
    
    // En cas d'erreur 401, nettoyer les tokens
    if (error.response?.status === 401) {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
    }
    
    return null;
  }
};

// Profile management
export const updateProfile = async (profileData: ProfileUpdateData): Promise<User> => {
  const response = await api.put('/auth/profile', profileData);
  return response.data.user;
};

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
