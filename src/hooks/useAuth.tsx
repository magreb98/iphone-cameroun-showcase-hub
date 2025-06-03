
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userData = await getAuthStatus();
        setUser(userData);
      } catch (err) {
        setError(err as Error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || user?.isSuperAdmin,
    isSuperAdmin: user?.isSuperAdmin
  };
};
