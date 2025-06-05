
import { useState, useEffect } from 'react';
import { getAuthStatus } from '@/api/auth';

interface User {
  id: number;
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  locationId: number | null;
  name: string | null;
  whatsappNumber: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Vérifier d'abord si un token existe
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userData = await getAuthStatus();
      if (userData) {
        setUser(userData);
      } else {
        // Si pas de données utilisateur, nettoyer le token
        localStorage.removeItem("admin_token");
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (err) {
      console.error("Erreur d'authentification:", err);
      setError(err as Error);
      setUser(null);
      
      // En cas d'erreur 401, nettoyer les tokens
      if ((err as any)?.response?.status === 401) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("token");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Function to refresh auth status
  const refreshAuth = () => {
    fetchUser();
  };

  // Function to clear user state (for logout)
  const clearUser = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || user?.isSuperAdmin,
    isSuperAdmin: user?.isSuperAdmin,
    refreshAuth,
    clearUser
  };
};
